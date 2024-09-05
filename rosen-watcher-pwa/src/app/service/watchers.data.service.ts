import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { DownloadService } from './download.service';
import { ChainService } from './chain.service';
import { Observable } from 'rxjs';
import { ChainType } from './chain.service';
import { WatcherInfo } from '../models/watcher.info';
import { Token } from '../models/token';

@Injectable({
  providedIn: 'root',
})
export class WatchersDataService {
  readonly watcherUrl =
    'https://api.ergoplatform.com/api/v1/addresses/ChTbcUHgBNqNMVjzV1dvCb2UDrX9nh6rGGcURCFEYXuH5ykKh7Ea3FvpFhHb9AnxXJkgAZ6WASN7Rdn7VMgkFaqP5Z5RWp84cDTmsZkhYrgAVGN7mjeLs8UxqUvRi2ArZbm35Xqk8Y88Uq2MJzmDVHLHzCYRGym8XPxFM4YEVxqzHSKYYDvaMLgKvoskFXKrvceAqEiyih26hjpekCmefiF1VmrPwwShrYYxgHLFCZdigw5JWKV4DmewuR1FH3oNtGoFok859SXeuRbpQfrTjHhGVfDsbXEo3GYP2imAh1APKyLEsG9LcE5WZnJV8eseQnYA8sACLDKZ8Tbpp9KUE7QZNFpnwGnkYx7eybbrCeFDFjTGpsBzaS6fRKrWj2J4Wy3TTyTU1F8iMCrHBF8inZPw9Kg9YEZuJMdXDFNtuaK15u86mF2s2Z5B1vdL5MtZfWThFLnixKds8ABEmGbe8n75Dym5Wv3pkEXQ6XPpaMjUxHfRJB3EfcoFM5nsZHWSTfbFBcHxSRnEiiU67cgJsBUpQn7FvEvqNLiKM4fL3yyykMtQ6RjAS8rhycszphvQa5qFrDHie4vPuTq8/balance/confirmed';

  readonly rsnToken = '8b08cdd5449a9592a9e79711d7d79249d7a03c535d17efaee83e216e80a44c4b';

  busyCounter = 0;

  constructor(
    private downloadService: DownloadService,
    private chainService: ChainService,
  ) {}

  getWatchersInfo(): Observable<WatcherInfo> {
    const result = this.downloadService.downloadStream(this.watcherUrl);

    return result;
  }

  getPermitsInfo(chainType: ChainType): Observable<Token | undefined> {
    const address = this.chainService.permitAddresses[chainType];
    const permitsUrl = `https://api.ergoplatform.com/api/v1/addresses/${address}/balance/confirmed`;
    return this.downloadService
      .downloadStream(permitsUrl)
      .pipe(
        map((data :{ tokens: Token[] }) => {
          if (data.tokens) {
            const tokenData = data.tokens.find((token: Token) => token.tokenId === this.rsnToken);
            if (tokenData) {
              tokenData.amount /= 3000 * Math.pow(10, tokenData.decimals);
              tokenData.amount = Math.floor(tokenData.amount);
            }
          }
          return data;
        }),
      )
      .pipe(
        map((result) => {
          return result.tokens.find((token: Token) => token.tokenId === this.rsnToken);
        }),
      );
  }
}
