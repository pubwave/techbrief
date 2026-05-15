export interface PubwaveCapabilities {
  paragraph: boolean;
  heading: boolean;
  blockquote: boolean;
  codeBlock: boolean;
  bulletList: boolean;
  orderedList: boolean;
  taskList: boolean;
  horizontalRule: boolean;
  image: boolean;
  table: boolean;
  chart: boolean;
  layout: boolean;
  embed: boolean;
  unknown: boolean;
}

export const DEFAULT_PUBWAVE_CAPABILITIES: PubwaveCapabilities = {
  paragraph: true,
  heading: true,
  blockquote: true,
  codeBlock: true,
  bulletList: true,
  orderedList: true,
  taskList: true,
  horizontalRule: true,
  image: true,
  table: true,
  chart: true,
  layout: true,
  embed: false,
  unknown: false
};
