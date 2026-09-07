export interface TlsInfo {
  valid: boolean;
  protocol?: string;
  cipher?: string;
  issuer?: string;
}

export interface SecuritySignals {
  https: boolean;
  tls: TlsInfo;
  hasCSP: boolean;
  hasHSTS: boolean;
  hasXFrameOptions: boolean;
  hasXContentTypeOptions: boolean;
  cookiesSecure: boolean;
  exposedPaths: string[];
}

export interface SecurityResult {
  score: number;
  signals: SecuritySignals;
  error?: string;
}

export type TosSeverity = "minor" | "moderate" | "major";

export interface TosRedFlag {
  text: string;
  severity: TosSeverity;
}

export type TosStatus = "analyzed" | "not_found" | "unavailable";

export interface TosResult {
  status: TosStatus;
  score: number | null;
  redFlags: TosRedFlag[];
  url?: string;
}

export type ReportCategory =
  | "scam"
  | "billing"
  | "non-delivery"
  | "data-misuse"
  | "other";

export type ReportStatus = "pending" | "verified" | "dismissed";

export interface CommunityReport {
  id: string;
  domain: string;
  category: ReportCategory;
  description: string;
  submittedAt: string;
  status: ReportStatus;
}

export interface CommunityResult {
  score: number;
  reports: CommunityReport[];
  verifiedScamCount: number;
}

export type Rating = "trustworthy" | "caution" | "high_risk";

export interface ScanResult {
  domain: string;
  scannedAt: string;
  security: SecurityResult;
  tos: TosResult;
  community: CommunityResult;
  overall: number;
  rating: Rating;
  overrideApplied: boolean;
}
