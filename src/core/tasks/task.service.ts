import mongoose from 'mongoose';
import { Task, ITask, TaskPriority, TaskStatus, TaskEntityType } from './task.model.js';
import { notificationService } from '../notifications/notification.service.js';
import { auditService } from '../audit/audit.service.js';
import { NotFoundError, BadRequestError } from '../common/errors.js';

export interface CreateTaskDTO {
  title: string;
  description?: string;
  assignedTo?: string;
  dueDate?: string | Date;
  priority?: TaskPriority;
  relatedEntity?: {
    entityType: TaskEntityType;
    entityId: string;
    entityName?: string;
  };
  tags?: string[];
}

export interface UpdateTaskDTO {
  title?: string;
  description?: string;
  assignedTo?: string;
  dueDate?: string | Date;
  priority?: TaskPriority;
  status?: TaskStatus;
  tags?: string[];
}

export interface TaskFilterOptions {
  status?: string;
  priority?: string;
  assignedTo?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  search?: string;
  limit?: number;
}

export const taskService = {
  async createTask(tenantId: string, data: CreateTaskDTO, userId: string): Promise<ITask> {
    const tenantObjectId = new mongoose.Types.ObjectId(tenantId);
    const creatorObjectId = new mongoose.Types.ObjectId(userId);

    const count = await Task.countDocuments({ tenantId: tenantObjectId });
    const taskNumber = `TSK-${String(count + 1).padStart(5, '0')}`;

    let assignedToObjectId: mongoose.Types.ObjectId | undefined;
    if (data.assignedTo && mongoose.Types.ObjectId.isValid(data.assignedTo)) {
      assignedToObjectId = new mongoose.Types.ObjectId(data.assignedTo);
    }

    let relatedEntityObj = undefined;
    if (data.relatedEntity && mongoose.Types.ObjectId.isValid(data.relatedEntity.entityId)) {
      relatedEntityObj = {
        entityType: data.relatedEntity.entityType,
        entityId: new mongoose.Types.ObjectId(data.relatedEntity.entityId),
        entityName: data.relatedEntity.entityName,
      };
    }

    const task = await Task.create({
      tenantId: tenantObjectId,
      taskNumber,
      title: data.title.trim(),
      description: data.description?.trim(),
      assignedTo: assignedToObjectId,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      priority: data.priority || 'MEDIUM',
      status: 'TODO',
      relatedEntity: relatedEntityObj,
      tags: data.tags || [],
      createdBy: creatorObjectId,
    });

    // Notify Assignee if assigned to someone other than the creator
    if (assignedToObjectId) {
      await notificationService.send({
        tenantId,
        userId: assignedToObjectId.toString(),
        title: 'New Task Assigned',
        message: `You were assigned task ${taskNumber}: "${task.title}"`,
        type: 'TASK_ASSIGNED',
        channel: 'IN_APP',
        actionUrl: `/tasks/${task._id}`,
        metadata: { taskId: task.id, taskNumber, priority: task.priority },
      });
    }

    await auditService.log({
      tenantId,
      userId,
      action: 'CREATE',
      entity: 'Task',
      entityId: task.id,
      metadata: { taskNumber, title: task.title, priority: task.priority },
    });

    return task;
  },

  async listTasks(tenantId: string, filters: TaskFilterOptions = {}): Promise<ITask[]> {
    const query: any = { tenantId: new mongoose.Types.ObjectId(tenantId) };

    if (filters.status) {
      query.status = filters.status;
    }
    if (filters.priority) {
      query.priority = filters.priority;
    }
    if (filters.assignedTo && mongoose.Types.ObjectId.isValid(filters.assignedTo)) {
      query.assignedTo = new mongoose.Types.ObjectId(filters.assignedTo);
    }
    if (filters.relatedEntityType) {
      query['relatedEntity.entityType'] = filters.relatedEntityType;
    }
    if (filters.relatedEntityId && mongoose.Types.ObjectId.isValid(filters.relatedEntityId)) {
      query['relatedEntity.entityId'] = new mongoose.Types.ObjectId(filters.relatedEntityId);
    }
    if (filters.search) {
      const searchRegex = new RegExp(filters.search.trim(), 'i');
      query.$or = [{ title: searchRegex }, { taskNumber: searchRegex }, { description: searchRegex }];
    }

    const limit = Math.min(100, Number(filters.limit) || 50);

    return await Task.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('assignedTo', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .lean() as any;
  },

  async getTaskById(tenantId: string, taskId: string): Promise<ITask> {
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      throw new BadRequestError('Invalid task ID');
    }

    const task = await Task.findOne({
      _id: new mongoose.Types.ObjectId(taskId),
      tenantId: new mongoose.Types.ObjectId(tenantId),
    })
      .populate('assignedTo', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .lean();

    if (!task) throw new NotFoundError('Task not found');
    return task as any;
  },

  async updateTask(tenantId: string, taskId: string, updates: UpdateTaskDTO, userId: string): Promise<ITask> {
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      throw new BadRequestError('Invalid task ID');
    }

    const task = await Task.findOne({
      _id: new mongoose.Types.ObjectId(taskId),
      tenantId: new mongoose.Types.ObjectId(tenantId),
    });

    if (!task) throw new NotFoundError('Task not found');

    const previousStatus = task.status;
    const previousAssignee = task.assignedTo?.toString();

    if (updates.title !== undefined) task.title = updates.title.trim();
    if (updates.description !== undefined) task.description = updates.description.trim();
    if (updates.priority !== undefined) task.priority = updates.priority;
    if (updates.tags !== undefined) task.tags = updates.tags;
    if (updates.dueDate !== undefined) {
      task.dueDate = updates.dueDate ? new Date(updates.dueDate) : undefined;
    }

    if (updates.assignedTo !== undefined) {
      task.assignedTo = updates.assignedTo && mongoose.Types.ObjectId.isValid(updates.assignedTo)
        ? new mongoose.Types.ObjectId(updates.assignedTo)
        : undefined;

      // Notify new assignee if changed
      if (task.assignedTo && task.assignedTo.toString() !== previousAssignee) {
        await notificationService.send({
          tenantId,
          userId: task.assignedTo.toString(),
          title: 'Task Assigned',
          message: `Task ${task.taskNumber} ("${task.title}") was assigned to you`,
          type: 'TASK_ASSIGNED',
          channel: 'IN_APP',
          actionUrl: `/tasks/${task._id}`,
        });
      }
    }

    if (updates.status !== undefined) {
      task.status = updates.status;
      if (updates.status === 'COMPLETED' && previousStatus !== 'COMPLETED') {
        task.completedAt = new Date();
      } else if (updates.status !== 'COMPLETED') {
        task.completedAt = undefined;
      }
    }

    await task.save();

    await auditService.log({
      tenantId,
      userId,
      action: 'UPDATE',
      entity: 'Task',
      entityId: task.id,
      metadata: { taskNumber: task.taskNumber, status: task.status, priority: task.priority },
    });

    return task;
  },

  async deleteTask(tenantId: string, taskId: string, userId: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      throw new BadRequestError('Invalid task ID');
    }

    const res = await Task.deleteOne({
      _id: new mongoose.Types.ObjectId(taskId),
      tenantId: new mongoose.Types.ObjectId(tenantId),
    });

    if (res.deletedCount === 0) throw new NotFoundError('Task not found');

    await auditService.log({
      tenantId,
      userId,
      action: 'DELETE',
      entity: 'Task',
      entityId: taskId,
    });
  },
};
