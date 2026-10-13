import {
  setStatusDelayed,
  setStatusFailed,
  setStatusUploaded,
  setStatusUploading,
} from "../repository/documentVersion/documentVersion.repository.ts";

export async function setStatusUploadingService(id: string): Promise<void> {
  await setStatusUploading(id);
}

export async function setStatusUploadedService(id: string): Promise<void> {
  await setStatusUploaded(id);
}

export async function setStatusFailedService(id: string): Promise<void> {
  await setStatusFailed(id);
}

export async function setStatusDelayedService(id: string): Promise<void> {
  await setStatusDelayed(id);
}
