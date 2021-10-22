import { getDeviceDescription, getDeviceID } from "../util/device";
import { default as NodeRSAType } from "node-rsa";

/**
 * WebSocket-esque class that handles messaging with Conduit through rift.
 */

export default class ValSocket {
    private socket: WebSocket;

    // Parâmetros normais do websocket
    // Parâmetros normais do websocket

    public onopen!: () => void;
    public onmessage!: (msg: MessageEvent) => void;
    public onclose!: () => void;
    public readyState = WebSocket.CONNECTING;

    // Estado para a UI
    public state = ValSocketState.CONNECTING;

    private key: CryptoKey | null = null;
    private encrypted = false;
    

    constructor(private code: string) {
        this.socket = new WebSocket("wss://rift.mimic.lol/mobile?code=" + code);
        this.socket.onopen = this.handleOpen;
        this.socket.onmessage = this.handleMessage;
        this.socket.onclose = this.handleClose;
    }
/**
* Encrypts the specified contents and sends them to the other side.
*/
    public async send(contents: string) {
    // Generate random IV
    const iv = new Uint8Array(16);
    window.crypto.getRandomValues(iv);
    
    //Encypt using AES-CBC
    const encryptedBuffer = await (window.crypto.subtle || window.crypto.webkitSubtle).encrypt({
        name: "AES-CBC",
        iv
    }, this.key!, stringToBuffer(contents));

    this.socket.send(JSON.stringify([
        ValOpcode.SEND, bufferToBase64(iv.buffer) + ":" + bufferToBase64(encryptedBuffer)
    ]));
    
   }

     /**
     * Handles a completed connection with Rift.
     */
    private handleOpen = () => {
        //Requisição da chave pública
        this.socket.send(JSON.stringify([ValOpcode.CONNECT, this.code]));
    };

    /**
     * Handles a wrapped message sent from Rift.
     */
    private handleMessage = (msg: MessageEvent) => {
        try {
            const [op, ...data] = JSON.parse(msg.data);

            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            if(op === ValOpcode.CONNECT_PUBKEY) {
                const pubkey = data[0];

                //Se não tiver chave pública, retorna um erro
                if(!pubkey) {
                    // eslint-disable-next-line @typescript-eslint/no-use-before-define
                    this.state = ValSocketState.FAILED_NO_DESKTOP;
                    return;
                }
                // eslint-disable-next-line @typescript-eslint/no-use-before-define
                this.state = ValSocketState.HANDSHAKING;
                this.sendIdentity(pubkey);
            }else if (op == ValOpcode.RECEIVE) {
                this.handleMobileMessage(data[0]);
            }
        }catch(ignored) {
            //Ignora a mensage inválida
        }
    };

    /**
     * Handles the closing of the socket.
     */
    private handleClose = (ev: CloseEvent) => {
        this.readyState = WebSocket.CLOSED;
        this.state = ValSocketState.DISCONNECTED

        //Notifica o wrapper
        if(this.onclose !== null) this.onclose();
    };
    /**
     * Takes the identity of this device, encrypts it with the specified public key
     * and sends it to the Conduit instance. Also chooses a random key.
     */
    private async sendIdentity(pubkey: string) {
        ///Gera uma compartilhada aleatória
        const secret = new Uint8Array(32);
        window.crypto.getRandomValues(secret);

        // Gera a chave WebCrypto
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        this.key = await(window.crypto.subtle || window.crypto.webkitSubtle).importKey("raw", secret.buffer, <any>{
            name: "AES-CBC"
        }, false,["encrypt", "decrypt"]);


    // node-rsa is particularly big and we only need it here, so extract it into its own chunk
    // however, do prefetch it so that it'll be available as quickly as possible
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        const NodeRSA: typeof NodeRSAType = <any>await import(/* webpackPrefetch: true */ /* webpackChunkName: "node-rsa" */ "node-rsa").then(x => x.default);
        const rsa = new NodeRSA();
        rsa.importKey(pubkey,"pkcs8-public-pem" )

        // Create our identification payload with the chosen secret and info on the device.
        const { device, browser } = getDeviceDescription();
        const identify = JSON.stringify({
            secret: bufferToBase64(secret.buffer),
            identity: getDeviceID(),
            device, browser
        });

        //Envia o handshake para o COnduit
        this.socket.send(JSON.stringify([
            ValOpcode.SEND,
            //[MobileOpcode.SECRET, rsa.encrypt(identify, "base64", "utf8")]
        ]));
    
    }
   /**
     * Handles a raw message received from Conduit. Possibly decrypts the contents before passing it on
     * to the normal message handler.
     */
    private async handleMobileMessage(parts: any) {
        if(this.encrypted && this.key && typeof parts === "string") {
            const [iv, encrypted] = parts.split(":");

            //Decripta a mensagemque chega
            const decrypted = await (window.crypto.subtle || window.crypto.webkitSubtle).decrypt({
                name: "AES_CBC",
                iv: stringToBuffer(atob(iv))
            },this.key!, stringToBuffer(atob(encrypted)));

            // Converto to string and dispatch
            const decryptedString = new TextDecoder("utf-8").decode(new Uint8Array(decrypted));

            if(this.onmessage !== null) {
                // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                this.onmessage(<any>{
                    data: decryptedString
                });
            }
            return;
        }


        if(Array.isArray(parts) && parts[0] === MobileOpcode.SECRET_RESPONSE) {
            const succeded = parts[1];

            if(!succeded) {
                this.state = ValSocketState.FAILED_DESKTOP_DENY;
                this.key = null;

                ///Notify the wrapper
                return;
            }
            //Handshake is done, we're "open" now.
            this.encrypted = true;
            this.readyState = WebSocket.OPEN;
            this.state = ValSocketState.CONNECTED;
            this.onopen();
        }
    }
   
}
// Helper to convert the specified arraybuffer to a base64 string.

function bufferToBase64(buf: ArrayBuffer) {
    return btoa(String.fromCharCode(...Array.from(new Uint8Array(buf))));
}
// Helper to convert the specified string into an ArrayBuffer.
function stringToBuffer(str: string) {
    const arr = new Uint8Array(str.length);
    for(let i = 0; i < arr.length; i++) arr[i] = str.charCodeAt(i);

    return arr.buffer;
}

export const enum ValSocketState{
    // Connecting to Hub socket/requesting public key
    CONNECTING,

    // Failed to get a public key for the specified key, probably invalid or offline.
    FAILED_NO_DESKTOP,

    // The desktop denied our connection request.
    FAILED_DESKTOP_DENY,

    // Performing a handshake with Conduit, user may need to accept the connection
    HANDSHAKING,

    // Succesfully connected and exchanging encrypted messages
    CONNECTED,

    // The hub socket disconnected us.
    DISCONNECTED
}
const enum ValOpcode {
    // Request Rift for pubkey.
    CONNECT = 4,

    // Rift either sends public key or null.
    CONNECT_PUBKEY = 5,

    // Send a message to our connected peer.
    SEND = 6,

    // Connected conduit sent a message to us.
    RECEIVE = 8
}

export const enum MobileOpcode {
    // Mobile -> Conduit, sends encrypted shared secret.
    SECRET = 1,

    // Conduit <- Mobile, sends result of secret negotiation. If true, rest of communications is encrypted.
    SECRET_RESPONSE = 2,

    // Mobile -> Conduit, request version
    VERSION = 3,

    // Conduit <- Mobile, send version
    VERSION_RESPONSE = 4,

    // Mobile -> Conduit, subscribe to LCU updates that match regex
    SUBSCRIBE = 5,

    // Mobile -> Conduit, unsibscribe to LCU updates that match regex
    UNSUBSCRIBE = 6,

    // Mobile -> Conduit, make LCU request
    REQUEST = 7,

    // Conduit -> Mobile, response of a previous request message.
    RESPONSE = 8,

    // Conduit -> Mobile, when any subscribed endpoint gets an update
    UPDATE = 9
}

declare global {
    interface Crypto {
        readonly subtle: SubtleCrypto;
        readonly webkitSubtle?: SubtleCrypto; // iOS 8 - 10.
    }
}
