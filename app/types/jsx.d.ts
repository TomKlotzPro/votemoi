declare global {
  declare namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: {
        [key: string]: string | number | boolean | object | undefined;
      };
      'next-route-announcer': {
        role?: string;
        'aria-live'?: string;
        'aria-atomic'?: string;
        style?: Record<string, string | number>;
        children?: React.ReactNode;
      };
    }
  }
}
