import { treatmentsDB, toPouch, fromPouch } from "@/lib/pouchdb";
import type { DiagnosisResult } from "./ai-diagnosis";
import { logger } from "../observability/logger";
import { metrics } from "../observability/metrics";

export interface TreatmentTask {
  id: string;
  specimenId: string;
  type: string;
  name: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "active" | "completed" | "rejected";
  description: string;
  actionRequired: string;
  approvalRequired: boolean;
  createdAt: string;
}

class TreatmentProtocolService {
  /**
   * Generates autonomous treatment tasks based on AI diagnosis results.
   */
  async generateProtocols(diagnosis: DiagnosisResult, specimenId: string): Promise<TreatmentTask[]> {
    logger.info('Governance', `Generating autonomous remediation swarm for ${specimenId}`);
    
    const tasks: TreatmentTask[] = diagnosis.issues.map(issue => {
      const isCritical = issue.severity === 'high';
      
      return {
        id: `task_${Math.random().toString(36).substring(7)}`,
        specimenId,
        type: issue.type,
        name: issue.name,
        priority: issue.severity,
        status: "pending",
        description: issue.description,
        actionRequired: issue.treatment,
        approvalRequired: isCritical, // Higher severity requires human-in-the-loop
        createdAt: new Date().toISOString()
      };
    });

    // Persist tasks to Tier 1 Registry
    for (const task of tasks) {
      await treatmentsDB.put(toPouch(task));
    }

    metrics.track('treatment_tasks_generated', tasks.length, { specimenId });
    return tasks;
  }

  /**
   * Approves a pending treatment task for execution.
   */
  async approveTask(taskId: string): Promise<void> {
    try {
      const doc = await treatmentsDB.get(taskId);
      const task = fromPouch<TreatmentTask>(doc);
      
      task.status = "active";
      await treatmentsDB.put(toPouch(task));
      
      logger.info('Governance', `Task ${taskId} APPROVED for execution.`);
    } catch (err) {
      logger.error('Governance', `Failed to approve task ${taskId}`, (err as Error).message);
    }
  }

  /**
   * Fetches all pending tasks requiring custodian approval.
   */
  async getPendingApprovals(): Promise<TreatmentTask[]> {
    const result = await treatmentsDB.find({
      selector: { status: "pending", approvalRequired: true }
    });
    return result.docs.map(doc => fromPouch<TreatmentTask>(doc));
  }

  /**
   * Fetches tasks for a specific specimen.
   */
  async getSpecimenTasks(specimenId: string): Promise<TreatmentTask[]> {
    const result = await treatmentsDB.find({
      selector: { specimenId }
    });
    return result.docs.map(doc => fromPouch<TreatmentTask>(doc));
  }

  /**
   * Manually creates a preventative task, typically triggered by a Neural Prophecy.
   */
  async createPreventativeTask(specimenId: string, name: string, description: string): Promise<TreatmentTask> {
    const task: TreatmentTask = {
      id: `prophecy_${Math.random().toString(36).substring(7)}`,
      specimenId,
      type: "PREVENTATIVE_PROPHECY",
      name,
      priority: "high",
      status: "pending",
      description,
      actionRequired: "Execute restorative sequence to nullify entropy.",
      approvalRequired: true,
      createdAt: new Date().toISOString()
    };
    await treatmentsDB.put(toPouch(task));
    
    logger.info('Governance', `PREVENTATIVE TASK CREATED for ${specimenId} via Neural Prophecy.`);
    return task;
  }
}

export const treatmentProtocolService = new TreatmentProtocolService();
