import { executeChild, proxyActivities } from '@temporalio/workflow';
import * as wf from '@temporalio/workflow';
import type * as activities from './activities/activities';

const { authModes, initateAuth, verifyAuth } = proxyActivities<typeof activities>({
  startToCloseTimeout: '5 mins',
});

const webhookTimeout = '90s';
const workflowTriggerTimeout = '180s';

enum facilityType {
  'HIP',
  'HIU',
}

const webhookSignal = wf.defineSignal<any>('webhook');
const responseQuery = wf.defineQuery<any>('responseState');
const startWorkflowSignal = wf.defineSignal<any>('startWorkflow');

export async function authModesWorkflow(requestId: string, id: string, facilityId: string, type: facilityType) {
  await authModes(requestId, id, facilityId, type);
  let webhookResponse: any,
    workflowRequest: any = null;

  wf.setHandler(webhookSignal, (req: any) => {
    webhookResponse = req;
  });
  wf.setHandler(responseQuery, () => webhookResponse);

  if (await wf.condition(() => webhookResponse !== null, webhookTimeout)) {
    wf.setHandler(startWorkflowSignal, (req: any) => {
      workflowRequest = req;
    });
    if (await wf.condition(() => workflowRequest !== null, workflowTriggerTimeout)) {
      const { authMode, purpose, workflowId } = workflowRequest;
      const args = [workflowRequest.requestId, id, facilityId, type, authMode, purpose];
      const resStart = await executeChild('initateAuthWorkflow', {
        args,
        workflowId,
      });
      return resStart;
    }
  }
  return 'No response';
}

export async function initateAuthWorkflow(
  requestId: string,
  id: string,
  facilityId: string,
  type: facilityType,
  authMode: string,
  purpose: string
) {
  await initateAuth(requestId, id, authMode, facilityId, type, purpose);
  let webhookResponse: any,
    workflowRequest: any = null;

  wf.setHandler(webhookSignal, (req: any) => {
    webhookResponse = req;
  });
  
  wf.setHandler(responseQuery, () => webhookResponse);

  if (await wf.condition(() => webhookResponse !== null, webhookTimeout)) {
    wf.setHandler(startWorkflowSignal, (req: any) => {
      workflowRequest = req;
    });
    if (await wf.condition(() => workflowRequest !== null, workflowTriggerTimeout)) {
      const { authCode, demographics, workflowId } = workflowRequest;
      const transactionId = webhookResponse?.body?.auth?.transactionId;
      const args = [workflowRequest.requestId, transactionId, authCode, authMode, demographics];
      return await executeChild('verifyAuthWorkflow', {
        args,
        workflowId,
      });
    }
  }
  return 'No response';
}

export async function verifyAuthWorkflow(
  requestId: string,
  transactionId: string,
  authCode: string,
  authMode: string,
  demographics: Record<string, any>
) {
  await verifyAuth(requestId, transactionId, authCode, authMode, demographics);
  let webhookResponse: any = null;
  wf.setHandler(webhookSignal, (req: any) => {
    webhookResponse = req;
  });

  if (await wf.condition(() => webhookResponse !== null, webhookTimeout)) {
    return webhookResponse;
  }
  return 'No response';
}
