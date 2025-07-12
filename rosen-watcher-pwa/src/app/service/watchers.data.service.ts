import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { DownloadService } from './download.service';
import { Observable } from 'rxjs';
import { ChainType } from '../../service/ts/models/chaintype';
import { WatcherInfo } from '../../service/ts/models/watcher.info';
import { Token } from '../../service/ts/models/token';
import '../../shared/ts/chain.service';

export function createChainNumber(): Record<ChainType, number | undefined> {
  return Object.fromEntries(Object.values(ChainType).map((key) => [key, undefined])) as Record<
    ChainType,
    number | undefined
  >;
}

export class WatchersStats {
  chainWatcherCount = createChainNumber();
  chainPermitCount = createChainNumber();
  activePermitCount = createChainNumber();
  chainLockedRSN = createChainNumber();
  chainLockedERG = createChainNumber();
  totalWatcherCount: number | undefined;
  totalPermitCount: number | undefined;
  totalActivePermitCount: number | undefined;
  totalLockedRSN: number | undefined;
  totalLockedERG: number | undefined;
  totalLocked: number | undefined;
  watcherValue: number | undefined;
  permitValue: number | undefined;
  selectedCurrency: Currency | null = null;
  rs_PermitCost = rs_PermitCost;
  rs_WatcherCollateralRSN = rs_WatcherCollateralRSN;
  rs_WatcherCollateralERG = rs_WatcherCollateralERG;
}

@Injectable({
  providedIn: 'root',
})
export class WatchersDataService {
  readonly watcherUrl =
    'https://api.ergoplatform.com/api/v1/addresses/ChTbcUHgBNqNMVjzV1dvCb2UDrX9nh6rGGcURCFEYXuH5ykKh7Ea3FvpFhHb9AnxXJkgAZ6WASN7Rdn7VMgkFaqP5Z5RWp84cDTmsZkhYrgAVGN7mjeLs8UxqUvRi2ArZbm35Xqk8Y88Uq2MJzmDVHLHzCYRGym8XPxFM4YEVxqzHSKYYDvaMLgKvoskFXKrvceAqEiyih26hjpekCmefiF1VmrPwwShrYYxgHLFCZdigw5JWKV4DmewuR1FH3oNtGoFok859SXeuRbpQfrTjHhGVfDsbXEo3GYP2imAh1APKyLEsG9LcE5WZnJV8eseQnYA8sACLDKZ8Tbpp9KUE7QZNFpnwGnkYx7eybbrCeFDFjTGpsBzaS6fRKrWj2J4Wy3TTyTU1F8iMCrHBF8inZPw9Kg9YEZuJMdXDFNtuaK15u86mF2s2Z5B1vdL5MtZfWThFLnixKds8ABEmGbe8n75Dym5Wv3pkEXQ6XPpaMjUxHfRJB3EfcoFM5nsZHWSTfbFBcHxSRnEiiU67cgJsBUpQn7FvEvqNLiKM4fL3yyykMtQ6RjAS8rhycszphvQa5qFrDHie4vPuTq8/balance/confirmed';

  readonly rsnToken = '8b08cdd5449a9592a9e79711d7d79249d7a03c535d17efaee83e216e80a44c4b';

  busyCounter = 0;

  constructor(private downloadService: DownloadService) {}

  getWatchersInfo(): Observable<WatcherInfo> {
    const result = this.downloadService.downloadStream<WatcherInfo>(this.watcherUrl);

    return result;
  }

  getPermitsInfo(chainType: ChainType): Observable<Token | undefined> {
    const address = permitAddresses[chainType];
    return this.downloadPermitInfo(address, this.rsnToken, null);
  }

  private downloadPermitInfo(address: string, tokenId: string | null, tokenName: string | null) {
    const permitsUrl = `https://api.ergoplatform.com/api/v1/addresses/${address}/balance/confirmed`;

    return this.downloadService
      .downloadStream<WatcherInfo>(permitsUrl)
      .pipe(
        map((data: { tokens: Token[] }) => {
          if (data.tokens) {
            const tokenData = data.tokens.find(
              (token: Token) =>
                (tokenId && token.tokenId === tokenId) || (tokenName && token.name === tokenName),
            );
            console.log(permitsUrl);
            if (tokenData) {
              tokenData.amount /= rs_PermitCost * Math.pow(10, tokenData.decimals);
              tokenData.amount = Math.floor(tokenData.amount);
            }
          }
          return data;
        }),
      )
      .pipe(
        map((result) => {
          return result.tokens.find(
            (token: Token) =>
              (tokenId && token.tokenId === tokenId) || (tokenName && token.name === tokenName),
          );
        }),
      );
  }

  getTriggerPermitsInfo(chainType: ChainType): Observable<Token | undefined> {
    const address = permitTriggerAddresses[chainType];
    return this.downloadPermitInfo(address, null, 'rspv2' + chainType + 'RWT');
  }

  getBulkPermitsInfo(chainType: ChainType): Observable<Token | undefined> {
    const address = permitBulkAddresses[chainType];
    return this.downloadPermitInfo(address, null, 'rspv2' + chainType + 'RWT');
  }
}
