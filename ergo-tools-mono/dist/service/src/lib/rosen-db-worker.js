"use strict";
if (typeof self !== 'undefined') {
    self.addEventListener('message', async (event) => {
        const data = event.data;
        console.log(`Rosen service worker received event of type ${data.type}`);
    });
}
//# sourceMappingURL=rosen-db-worker.js.map