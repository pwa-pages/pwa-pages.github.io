import { IStorageService, rs_DownloadStatusStoreName } from "./constants";
import { DataService } from "./data.service";
import { DownloadStatus } from "./models";
export class DownloadStatusMemoryService<T> {

  //private static addressDownloadDateMap = new Map<string, Date>();

  constructor(
    private dataService: DataService<T>,
    private db: IStorageService<T>,
  ) {
  }

  // Get Download Status for Address from IndexedDB
  async getDownloadStatus(
    address: string
  ): Promise<DownloadStatus> {
    const status = await this.db.getDataById(
      rs_DownloadStatusStoreName,
      address + '_' + this.dataService.getDataType(),
    );
    return status as DownloadStatus;
  }

  // Set Download Status for Address in IndexedDB
  async setDownloadStatus(
    address: string,
    status: string,
  ): Promise<void> {
    let dbStatus: DownloadStatus | undefined = await this.getDownloadStatus(
      address
    );

    if (!dbStatus) {
      dbStatus = {
        address: address + '_' + this.dataService.getDataType(),
        Address: address,
        status: status,
        lastDownloadDate: undefined,
      };
    } else {
      dbStatus.status = status;
      dbStatus.address = address + '_' + this.dataService.getDataType();
      dbStatus.Address = address;
    }

    await this.saveDownloadStatus(dbStatus);
  }

  async saveDownloadStatus(
    downloadStatus: DownloadStatus
  ): Promise<void> {
    await this.db.addData(
      rs_DownloadStatusStoreName,
      [downloadStatus],
      downloadStatus.address,
    );
  }

}
