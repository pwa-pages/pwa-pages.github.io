import { Component, OnInit } from '@angular/core';
import { DownloadService } from './download.service';
import { StorageService } from './storage.service';
import { DataService } from './data.service';
import { forkJoin, Observable } from 'rxjs';


@Component({
  selector: 'app-chart',
  templateUrl: './app.chart.html',
  styleUrl: './app.chart.css'
})


export class AppChart implements OnInit {

  data: string;
  rewardsChart: any[];
  readonly rewardsCardanoAddress: string = "2Eit2LFRqu2Mo33z3pYTJRHNCPYS33MrU9QgeNcRsF9359pYMahqnLvKsHwwH72C6WDSZRj7G7WC5heVyUEawcSLSx821iJXT4xWf2F5fjVWDUskGdVdyYY5RBJnp3dfYC7iPoRNeopAFQWFwEbTieow347UhRyqvo2LntFpXzomvGwVTfq9YXS8Z1GGW5mUEioD5xC17Sz72NLbQrskSx7QZAxQTbMGh6vwM9J4q7NzRmQeHmWaHLpUHMU4Jdd5ccKumMvAY8d5C8RxB4iATySLY2N1wY84qNsWNaqkNofbUebf6LgmU9HTKAmU3nDoBfX7mhCjH8kXDhZeYdRsuLVFEYu83TkpwgHAYGmUoemxWAeA2BKMx8CBAy9jxbCyUjdnk9i7sLxuejrwLLh8W4tP81YkESjZ8BV65BhzPdvCaiX8vBSorgFfnvGKVzwfhhsSDwLY1GUwLTMLwTUTjSzEjsMX9hzsEEEmhxLsekabLmK3HZ1jssLrFryNuE59uS51hazJsi3gsT8SBk1J9YV6Dq6xto28nLqrMqK6raqLcAm2iU8hBtqdoSXqWzsrZHpqc2uLGhY52ee4k9TpFBvN1RovYUtY6KS4FncT4UgnbEFkzsnWYKX3CDn16tJs5CyZ97gKcvUonZ5EqTwabzni14CcQsTtKtEAqj1odvSyfJ94NnEjuiVPC3VmZbQvveN3bQ";
  readonly rewardsErgoAddress: string = "2Eit2LFRqu2Mo33z3pYTJRHNCPYS33MrU9QgeNcRsF9359pYMahqnLvKsHwwH72C6WDSZRj7G7WC5heVyUEawcSLSx821iJXT4xWf2F5fjVWDUmvtxr3QSv1aLwThLXxeqYCCc34xjxZDPqPyNGYvWLNeBZxATvBeDuQ6pSiiRFknqmvYVsm9eH4Et3eRHCyxDJEoqZsAahwfVSya34dZNHmjaPQkwWo3Coc17pxiEnWuWmG38wSJz1awE6cymzhojnjxDTbbXgjR1yfYU3AU2v9zttnT8Gz3gUzZNSwjiXSPu3G9zkDaFZVKqb5QwTWY3Pp6SFJgBQfx3C3sp4a9d3n9c98pfWFWAGQN5EfkoHosF8BQTDuzXG3NU8gVCNeNPXYA8iWCbvY3XpxQMvQUxqkjDv9VQfUNvAKVHLW43chi2rdBrQ7Teu6NnesLRWUKXpzSxpByWftkCCdBppjZtYmhhCHqpQGkQyTcMRoP2krFKe7xKbfnFkdkhaYH9TTdKuTuKtGb265RXxiqrc34KvkZpaBBQB5UvoCU4iLSDngNTjqkNPnWekDahzNHLd6CtcdC1B19jdGEXWeNADemDtdK4zrMNg7U8iVpyGYhLDnkeLVrcbhoxkHxrFwfrN19XvitDosQqmt9dseR6SWHBCDZJdmJecCiEwd2wBiwN5N5umEy3Dd4Hznv7kDr6eX7KtYxp";
  adresses_remove_this: string[];
  adresses: string[];

  constructor(private downloadService: DownloadService, private storageService: StorageService, private dataService: DataService) {

    this.data = "";



    this.adresses_remove_this = [
      '9h9H4FJ7jWLZ4ZvJQ9BccWKewoXdAn4mfkqwmoh9HwqjP6oB63C',
      '9ff1hjyscYM53GjWEJ3QfR65PDC8qp8RwhD8TFiZZhCGhHFhRU6',
      '9g64CUoAUnXWu6KmSsXv6fdawmkyrhZhrEHG9KAjDyy6DCPwKDg',
      '9hENULphzbxZaSjfMow8doKrru3Scgd1L7tm6dXxHTVDyTEUCzY',
      '9gwDcdAsZ2gAJdmSuFnFgbAG7dbxExDVSdSTnbYvSXvyS4YnqU6'
    ];

    this.adresses = this.adresses_remove_this;
    this.rewardsChart = [];
  }

  retrieveData(): void {
    this.dataService.getTotalRewards().then(t => this.data = t);
    this.dataService.getRewardsChart().then(r => this.rewardsChart = r);
  }

  ngOnInit(): void {

    var storageService = this.storageService;

    this.retrieveData();
    var downLoads: Observable<any>[] = [];

    this.adresses_remove_this.forEach(adress => {

      var s = this.downloadService.downloadTransactions(adress);

      s.subscribe(result => {

        console.log('Storing data to db from address: ' + adress);

        result.items.forEach((item: any) => {
          item.inputs.forEach((input: any) => {

            storageService.addData(adress, item, input);
          });

        });
        
      });
      downLoads.push(s);

    });

    forkJoin(downLoads).subscribe({
      next: (results) => {
        
      },
      error: (err) => {
        console.error('Something went wrong:', err);
      },
      complete: () => {
        this.retrieveData();
      }
    });

  }

  title = 'rosen-watcher-pwa';
}