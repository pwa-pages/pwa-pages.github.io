interface AddressData {
  address: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
class DownloadService {
  constructor(private dataService: DataService) {}

  async downloadForAddresses(): Promise<void> {
    try {
      const addresses: AddressData[] = await getData<AddressData>(
        rs_AddressDataStoreName,
        this.dataService.db,
      );

      const downloadPromises: Promise<void>[] = addresses.map(async (addressObj: AddressData) => {
        await downloadForAddress(addressObj.address, this.dataService.db);
      });

      await Promise.all(downloadPromises);
    } catch (e) {
      console.error('Error downloading for addresses:', e);
    }
  }
}
