import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { DownloadService } from './download.service';
import { EventService } from './event.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { forkJoin } from 'rxjs';
import { ChainType } from './data.service';

@Injectable({
  providedIn: 'root',
})
export class WatchersDataService {
  readonly permitsCardanoAddress: string =
    'NY4PEzZ7VfjqPk9gZSNS6ERoYyYBEBebyeXUPs1sjEfdenV3Kq1QKWBSQ1Gfem47fPVRw5UXcYNXtgXNGqsD4DedukcYv5c5kviu94yWpyrh2tbXHea1tyfuEcb8njgvXkAxrXkjvgcPEQqy7BsR3KQPe8vzSaBG5V8WFHQqvHmpMXXYMvKDZzRbNjZUgYvVinGq6qx9hct1fFG15nFdcWZkzhBcu8ytydt3MmnkYEyL4L2rLD8Jp2Q16DfeaBBqmuyxpMoVxPrQzbPjq5GKTKrqnpisWVrubpAy5dg1oQ6tVZompLpwTWvX1xWspA9tWPmc3MCV2e6y313KzSosGLi2Sdv2ptDgJpKamQv6fNKmj3TWkNbPCDfjp2KXYcfYE1vQ5prRZCPCDhVgWP7bqpF3SeUTMJmvBaXjd1tBavjanquQDkYU4n5XBwJPvUa5kCAP1USTgP4cgPA6SzB8hg2RXmB4PmEWM2RWv2mrirYeTdZrzXCbpGCd9B9GK7bNknnYz1X8wVqyYxxQMZ7Rort4BVRNPNKzEMtdGKSmQpiWitfoAfphXL3SGMfwMT3sspgDcD93Ftiq9gf6kgawpFBKWJmV5jXmfiSCWkPW5x56L5hcc3NwJLYYjcMh81aXQBP4HguyudttZcF8QiDa6Ae3idS1BTegArbhZBFn1TQJGgWtuCubLC5Ja71FadEN1G1s4Uz4BapDu3WpNH4NJn3UeWavLd1EytGjevyJu8XjziAMYr6cPZsyhb95aj7LAHgwJ8YT42zWYoDxqhEzbuderVtfauVJxEo2Rt7p83hMtkFS8Dy3vNbdmGEhWEFfDEyquEHTLsYkehRMWTeTeoDpRhKpeXoDxTNriR6Fz6y3Koxwzg281gYhxxvew7TpvSa3cLvjBpNxuoUfhyT645u51cBsQzden3RB5LjJeToSctrx74nNGCm9sR7fQgzno2pETeit1mykq4eocy93EoTcypKitcbfhgAYwXrGcGUQyhsupFgPZMnms5VnWhCsGKkK93uy7z4BRgi9y2aU7zMUxPJN6q3kYhjcdgYhcgqLLmWo5pBRSxcuq3p3NhPnd2Tps5RztjtUS5ZkbRVsTri8Sy2J5xPLir6VB7uxcPCSYYGJaaVfENJ8tYLYH3m3TUoxRipyjNDDBmsRdujqFQvFoYiCyaPFgu9iqzMvuPDM7FDPAKV8V7A895N9SMMZkG7uAzVvLgrU8Wrxdby2CAX9ttmPJn';
  readonly permitsBitcoinAddress: string =
    'NY4PEzZ7VfjtnTN697R7my9uAVkCYb6N71J2RSmJCFSdDqVf9aPvFQqKXujYDBtSA8hxYVUgkGgU9SP2Ss7JDUkHkdGLBqZwH4yDcPyVvbVbcre3o7nR59wiFDVtjzCjfZmVvMVJD9HiW4GKqVuZGTQCKns8tDe3sJoDNTL3VmhzRUPZf9JCN4TNji1ruXf5CxqWtDrCfoxE4xfbRWGmtBMdLMoRdL85V7z1fP5KxroWX5YgZQo28nTCU3WjPuY2YrjqYYGNHXvFZ9G8E85kCcseNtRWqViXGFzmwqHWKaYe4AdJzBbMKzJWYszsbiemNvisPtT2Yj3FjAmAErpW3gMeWyH3WtbipaAu9D31ggpLeLkLTGscJ9HB2oExpGWvv6u9mGdkTJMHYUuZJUGrcJPE3m7ZTEFxwkbeR9oD8nHHgW4SB46kHFbxzNoUksGPZQnxf95J3e5PUnhYgg7mrQLNpq6pphgGukFcHDgAN2rgFmUSDVsuzomhP735SMiveXSPzx6PZeP7CmrEHyXN6mFbBJuY17kvzzix1w9eFwryZDuZqnAANkYhF3TLkLyGZfSC4o9iAGynpivuNMUgbKAuj6D116tKoCq9PHELL8eTefmXNLFuhauQuKRjmWQKj9zYSd7qi6Zf49KX25PnWHkC3REc4abYpjtiQFefT2HkWRwneTCkJ8uMvoHs6kJzLg8NVzH8XwEZhTM2tNSDhBKZaURpYiQcHwLDgv5uFiwhasLAdZi2EJywBYX51NKc6m4MEsTiAJC9jkEydWcwyDzSHN18yEr4rvEgMNkUhLHJokgV2v3BNFhUTJqe58e2QXAmx9MytUDqzg3vwexEpMhueC2roYA27P1mmb85HKEz15a8LnuUT8ZjmG8kDbHuPYFyxcATytVuDrFDzqKBt9X36bocip4ZU4RRY8JcWjJvMcrBCjV3EhDVQ4it8bhoZnn79PsXazvDteua1NEYEJniPnNrRaiKTUWrseEUQ2vVjWy134jMxRbeiARhoj7MDxug2kFP8jRGSsxWt3Qqbv2SezT3xZ8jYxTyQ2CiyJ61CvUQwPtmoY3XKjrgrJKwnSzJRs4egKPYZKoSiSy6UdHMKuNDmys8wYo3Gi2EgVdUYRLLWcHh5Z2H91odSbTW2h5e6pZeY4a45TgihE6ZnZBhHGc75zJjukhPgP1wEp8GrreHA7ejvTEmpwNgj571x5JrvRD5TxWaFuZKBonGexovAK2L5v';
  readonly permitsErgoAddress: string =
    'NY4PEzZ7Vfjvo3AYu7dBh4ziatarsMAVPnwtHZL6BfoKeaots7P629HvVAmDZNdiVNUitWMqVJhgphUregwCXnhVNRddztP93qbtSWCMzVk1UQmCVUpvQyb25nyH1PrpRSjpFewJWeN3bjiVF6bTAm2t11X4d2fKGnAo3PX2BFVeyAUre7T5CZs2uikxZisyrJ1djE4UY1uwpTFkJv3RzZ3JMugNDeicf7qWqtCtNH8E9uG56VD2dMvmsr5YHQbrKgxa5foyA4K8cD59o2ub9ezbhjSgfXbc6VLaXmp5SzdP6n61MaePNexedifBWwAsHFcaaVXf7oUkePp5dDpc5mBbaAuidBAwH4SaxnUNjPw2bHVSXEk3ZJwwBrZRG7CYBCvEN6wFuPyzuhGsJQwdCtvUqxViGhxWrhRYKwixLhScVdGwCFCF9HjuCXt92FkEZKRk1kJuNzMUuc9AUbafbwhi8RC96TVQrtnsajhomptLKFmQXg4nZQao3jwHV8kfZeyF9BX5kiWUnC83Wa7X7seGUcECHRPLAapk7Lr1kUQ6Q62RpBKeGUsfmPcyNhaZ2bmdxMxxHAhdZdKVr78R5ch2BvG7ZtV6wkHB1hcVJGJmU4dskPPR5EFd8gED72eeUnNAsTknW7ePfNMj4DYWGqf2QhPHDZXsyRN2Mczv4tgyRsNA2HR3U9oZikejcuYhha9yNsXEdNn23B8wa5aDZwR6hwZ9hQ74yv29sbfBAfe9XWT2UZAVaeZeazQSSrvAhicEKnwmCAvfwcZNS57SHJ1EfZf1oEt66S6mGFdBzcKPLZzmJmCgMiBmMThqMemT1XS1ovES76LVcpXSkyiEdA17htR5HuPWdDVfWNQAK2jAM8BjKGtvsh93oMFGvMaBVBAvj1QcfTr17LdeeT7h78bKzyF5SQWuyu46xtDbmTZVrR1ZSpnffiD8TbWnae85Bw1VfttScQ8yfa26dsc9pwLrHhYhC4XKEVPWYUxLHZd959tLA2kGNkJBJR8PPThR8PugaUTq1sQpLg4ezPPUjYyWFvhFf6Rcw5rcJAwj99AUwoEhPaUnxT3TxiEJBbD3Zsna33mQD9Zg69Zzr9xiLA7GzhhA998dwkpbbgqFxyASwH6yav5qDbXPZH7GPtt3nTjUfRs87SGYgVGHoGhqaVUAfQKW4TtvFicdpvQws5kg1nZthd7WkWcR7HqLc1R4wBPFynFVGc457vhQwaP78yQsQDHq86';
  readonly watcherUrl =
    'https://api.ergoplatform.com/api/v1/addresses/ChTbcUHgBNqNMVjzV1dvCb2UDrX9nh6rGGcURCFEYXuH5ykKh7Ea3FvpFhHb9AnxXJkgAZ6WASN7Rdn7VMgkFaqP5Z5RWp84cDTmsZkhYrgAVGN7mjeLs8UxqUvRi2ArZbm35Xqk8Y88Uq2MJzmDVHLHzCYRGym8XPxFM4YEVxqzHSKYYDvaMLgKvoskFXKrvceAqEiyih26hjpekCmefiF1VmrPwwShrYYxgHLFCZdigw5JWKV4DmewuR1FH3oNtGoFok859SXeuRbpQfrTjHhGVfDsbXEo3GYP2imAh1APKyLEsG9LcE5WZnJV8eseQnYA8sACLDKZ8Tbpp9KUE7QZNFpnwGnkYx7eybbrCeFDFjTGpsBzaS6fRKrWj2J4Wy3TTyTU1F8iMCrHBF8inZPw9Kg9YEZuJMdXDFNtuaK15u86mF2s2Z5B1vdL5MtZfWThFLnixKds8ABEmGbe8n75Dym5Wv3pkEXQ6XPpaMjUxHfRJB3EfcoFM5nsZHWSTfbFBcHxSRnEiiU67cgJsBUpQn7FvEvqNLiKM4fL3yyykMtQ6RjAS8rhycszphvQa5qFrDHie4vPuTq8/balance/confirmed';
  readonly rsnToken =
    '8b08cdd5449a9592a9e79711d7d79249d7a03c535d17efaee83e216e80a44c4b';

  busyCounter: number = 0;

  constructor(
    private downloadService: DownloadService,
    private eventService: EventService,
    private snackBar: MatSnackBar,
  ) {}

  getWatchersInfo(): Observable<any> {
    var result = this.downloadService.downloadStream(this.watcherUrl);
    return result;
  }

  getPermitsInfo(address: string): Observable<any> {
    const permitsUrl = `https://api.ergoplatform.com/api/v1/addresses/${address}/balance/confirmed`;
    return this.downloadService.downloadStream(permitsUrl).pipe(
      map((data) => {
        if (data.tokens) {
          const tokenData = data.tokens.find(
            (token: any) => token.tokenId === this.rsnToken,
          );
          if (tokenData) {
            tokenData.amount /= 3000 * Math.pow(10, tokenData.decimals);
            tokenData.amount = Math.floor(tokenData.amount);
          }
        }
        return data;
      }),
    );
  }

  getPermitssInfo(chainType: ChainType): Observable<any> {
    switch (chainType) {
      case ChainType.Cardano:
        return this.getPermitsInfo(this.permitsCardanoAddress).pipe(
          map((result) => {
            return {
              cardanoTokenData: result.tokens.find(
                (token: any) => token.tokenId === this.rsnToken,
              ),
            };
          }),
        );
      case ChainType.Bitcoin:
        return this.getPermitsInfo(this.permitsBitcoinAddress).pipe(
          map((result) => {
            return {
              bitcoinTokenData: result.tokens.find(
                (token: any) => token.tokenId === this.rsnToken,
              ),
            };
          }),
        );
      case ChainType.Ergo:
        return this.getPermitsInfo(this.permitsErgoAddress).pipe(
          map((result) => {
            return {
              ergoTokenData: result.tokens.find(
                (token: any) => token.tokenId === this.rsnToken,
              ),
            };
          }),
        );
    }
  }
}
