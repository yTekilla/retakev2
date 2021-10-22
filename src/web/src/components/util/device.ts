const DEVICES = [
    { name: 'Windows Phone', value: 'Windows Phone' },
    { name: 'Windows computer', value: 'Win' },
    { name: 'iPhone', value: 'iPhone' },
    { name: 'iPad', value: 'iPad' },
    { name: 'Kindle device', value: 'Silk' },
    { name: 'Android device', value: 'Android' },
    { name: 'PlayBook', value: 'PlayBook' },
    { name: 'BlackBerry', value: 'BlackBerry' },
    { name: 'macOS computer', value: 'Mac' },
    { name: 'Linux computer', value: 'Linux' },
    { name: 'Palm device', value: 'Palm' }
];

const BROWSERS = [
    { name: 'Edge', value: 'Edge' },
    { name: 'Chrome', value: 'Chrome' },
    { name: 'Firefox', value: 'Firefox' },
    { name: 'Safari', value: 'Safari' },
    { name: 'Internet Explorer', value: 'MSIE' },
    { name: 'Opera', value: 'Opera' },
    { name: 'BlackBerry', value: 'CLDC' },
    { name: 'Mozilla', value: 'Mozilla'},
];/**
* Retorna um objeto contendo o navegador e disposotivo móvel da sessão atual
 */
export function getDeviceDescription(): { browser: string, device: string } {
    const device = DEVICES.filter(x => navigator.userAgent.indexOf(x.value) !== -1);
    const browser = BROWSERS.filter(x => navigator.userAgent.indexOf(x.value) !== -1);

    return {
        browser: (browser.length ? browser[0].name: "Navegador desconhecido"),
        device: (device.length ? browser[0].name: "Dispositivo desconhecido")
    };
}
/**
 * Encontra ou gera um ID únoco para o dispositivo que é usado para o Conduit
 * para lembra-lo em conexões subsequentes. Armazenado em localStorage.
 */

export function getDeviceID(): string {
    const hasLocaalStorage = "localStorage" in window && localStorage;
    if(hasLocaalStorage && localStorage.getItem("deviceID")) {
        return localStorage.getItem("deviceID")!;
    }
    // Source: https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript

    const uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0, v = c === "x" ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });

    if(hasLocaalStorage) {
        localStorage.setItem("deviceID", uuid)
    }

    return uuid;
}