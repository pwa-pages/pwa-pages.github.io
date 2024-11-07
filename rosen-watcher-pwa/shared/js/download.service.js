// eslint-disable-next-line @typescript-eslint/no-unused-vars
class DownloadService {
    dataService;
    constructor(dataService) {
        this.dataService = dataService;
    }
    async downloadForAddresses() {
        try {
            const addresses = await getData(rs_AddressDataStoreName, this.dataService.db);
            const downloadPromises = addresses.map(async (addressObj) => {
                await downloadForAddress(addressObj.address, this.dataService.db);
            });
            await Promise.all(downloadPromises);
        }
        catch (e) {
            console.error('Error downloading for addresses:', e);
        }
    }
}
