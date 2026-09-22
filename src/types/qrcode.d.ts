declare module 'qrcode' {
  interface QRCodeOptions {
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
    type?: 'image/png' | 'image/jpeg' | 'image/webp' | 'image/svg+xml' | string;
    width?: number;
    margin?: number;
    color?: {
      dark?: string;
      light?: string;
    };
    [key: string]: unknown;
  }

  interface QRCode {
    toDataURL(data: string | object, options?: QRCodeOptions): Promise<string>;
    toCanvas(canvas: HTMLCanvasElement, data: string | object, options?: QRCodeOptions): Promise<void>;
    toString(data: string | object, options?: QRCodeOptions): Promise<string>;
  }

  const QRCode: QRCode;
  export default QRCode;
}
