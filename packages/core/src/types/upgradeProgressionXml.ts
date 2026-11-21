// Parsed with attributes and with these elements forced to arrays, see
// `AbstractVFS.xmlWithAttributes`

// Plain text unless the connector carries `verticalFirst`
export type UpgradeProgressionXmlRequirement =
  | string
  // Attribute values stay strings
  | { "#text": string; "@_verticalFirst"?: string };

export interface UpgradeProgressionXmlAttribute {
  attributeName: string;
  // Numbers, or `true`/`false` for switches
  value: number | boolean;
}

export interface UpgradeProgressionXmlNode {
  id: number;
  techName: string;
  nodeType:
    | "NODETYPE_COMMON"
    | "NODETYPE_MECHANIC"
    | "NODETYPE_ALTERNATIVE_MECHANIC";
  xpCost?: number;
  displayName?: string;
  icon?: string;
  gridPosition?: { row: number; column: number };
  // Empty elements parse to an empty string
  requiredNodes?: "" | { node: UpgradeProgressionXmlRequirement[] };
  attributes?: { attribute: UpgradeProgressionXmlAttribute[] };
}

export interface UpgradeProgressionXmlGroup {
  techName: string;
  displayName: string;
  description: string;
  icon?: string;
  xpCost: number;
  gridPosition: { row: number; column: number };
  requiredNodes: { node: UpgradeProgressionXmlRequirement[] };
  alternativeNodes: { node: string[] };
}

export interface UpgradeProgressionXml {
  matrix: { rows: number; columns: number };
  alternativeMechanicGroups?: {
    alternativeMechanicGroup: UpgradeProgressionXmlGroup[];
  };
  nodes: { node: UpgradeProgressionXmlNode[] };
}

export interface UpgradeAttributesXml {
  root: {
    attributes: {
      attribute: {
        attributeName: string;
        icon: string;
        title: string;
      }[];
    };
  };
}
