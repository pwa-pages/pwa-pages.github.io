import { IStorageService, rs_DownloadStatusStoreName } from "./constants";
import { DataService } from "./data.service";
import { DownloadStatus } from "./models";

export interface DownloadStatusServiceContract {
  getDownloadStatus(address: string): Promise<DownloadStatus>;
  setDownloadStatus(address: string, status: string): Promise<void>;
  saveDownloadStatus(downloadStatus: DownloadStatus): Promise<void>;
}

export class DownloadStatusService<T = unknown> implements DownloadStatusServiceContract {
  constructor(
    private dataService: DataService<T>,
    private db: IStorageService,
  ) {}

  async getDownloadStatus(address: string): Promise<DownloadStatus> {
    const status = await this.db.getDataById<DownloadStatus>(
      rs_DownloadStatusStoreName,
      `${address}_${this.dataService.getDataType()}`,
    );
    return status as DownloadStatus;
  }

  async setDownloadStatus(address: string, status: string): Promise<void> {
    const key = `${address}_${this.dataService.getDataType()}`;
    const dbStatus = (await this.getDownloadStatus(address)) ?? {
      address: key,
      Address: address,
      status,
      lastDownloadDate: undefined,
    };

    dbStatus.address = key;
    dbStatus.Address = address;
    dbStatus.status = status;

    await this.saveDownloadStatus(dbStatus);
  }

  async saveDownloadStatus(downloadStatus: DownloadStatus): Promise<void> {
    await this.db.addData(
      rs_DownloadStatusStoreName,
      [downloadStatus],
      downloadStatus.address,
    );
  }
}
