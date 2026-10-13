import {
  setStatusDelayed,
  setStatusFailed,
  setStatusUploaded,
  setStatusUploading,
} from "../repository/documentVersion/documentVersion.repository.ts";

async function setStatusUploadingService(id: string): Promise<void> {
  await setStatusUploading(id);
}

async function setStatusUploadedService(id: string): Promise<void> {
  await setStatusUploaded(id);
}

async function setStatusFailedService(id: string): Promise<void> {
  await setStatusFailed(id);
}

async function setStatusDelayedService(id: string): Promise<void> {
  await setStatusDelayed(id);
}
