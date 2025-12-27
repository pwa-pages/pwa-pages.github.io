import { IDownloadService } from '@ergo-tools/service';
import { GetDownloadService } from '@ergo-tools/service';



console.log('Hello World');

var downloadService: IDownloadService = GetDownloadService();
downloadService.downloadForAddress(
  '9fTbZHMsuBeWYAWsw7Nr61zNSe4i2FLrREhJcFGRkKLmNYVFwqL', true);

/*
const downloadActivePermitsService: DownloadService<PermitTx> =
      new DownloadService<PermitTx>(
        rs_FullDownloadsBatchSize,
        rs_InitialNDownloads,
        activepermitsDataService,
        this.eventSender,
        downloadStatusIndexedDbActivePermitsDataService,
      );
*/