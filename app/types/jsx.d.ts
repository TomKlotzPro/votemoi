declare global {
  declare namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
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
