
export const APP_CONSTANTS = {
  CAMERA: {
    WIDTH: 1280,
    HEIGHT: 720,
    ASPECT_RATIO: 16 / 9,
  },
  VALIDATION: {
    REQUIRED_FIELDS: ['address', 'deviceType', 'deviceSize', 'serialNumber'],
    TEST_PATTERN: /^\d+(\.\d+)?(\s*PSI)?$/,
  },
  PDF: {
    DEFAULT_FONT_SIZE: 12,
    HEADER_FONT_SIZE: 16,
  }
} as const;
