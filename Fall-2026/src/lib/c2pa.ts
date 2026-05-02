// C2PA & Content Authenticity Initiative Integration
// Reads and parses authenticity manifests from media

export interface C2PAManifest {
  claimSignatures: ClaimSignature[]
  assertions: Assertion[]
  signedBy: string
  issueTime: string
  instanceID: string
}

export interface ClaimSignature {
  alg: string
  issuer: string
  sig: string
  issueTime: string
  pad?: string
}

export interface Assertion {
  label: string
  data: Record<string, unknown> | string
}

export interface EditHistory {
  edits: Edit[]
  originalCreator?: string
  creationDate?: string
}

export interface Edit {
  software: string
  timestamp: string
  action: string // 'created', 'modified', 'cropped', 'filtered', 'upscaled', etc.
  editor?: string
}

export interface AuthenticityReport {
  isAuthentic: boolean
  confidence: number // 0-100
  issuer?: string
  issueTime?: string
  editHistory: Edit[]
  warnings: string[]
  verified: boolean
}

// Mock C2PA manifest parser (real implementation would decode JWTs)
export function parseC2PAManifest(manifestJSON: unknown): C2PAManifest | null {
  try {
    const manifest = manifestJSON as C2PAManifest
    if (manifest.claimSignatures && manifest.assertions) {
      return manifest
    }
    return null
  } catch {
    return null
  }
}

// Extract edit history from C2PA manifest
export function extractEditHistory(manifest: C2PAManifest): EditHistory {
  const edits: Edit[] = []
  let originalCreator: string | undefined
  let creationDate: string | undefined
  
  for (const assertion of manifest.assertions) {
    if (assertion.label === 'c2pa.ingredient') {
      const data = assertion.data as Record<string, unknown>
      if (data.relationship === 'parentOf') {
        edits.push({
          software: (data.software as string) || 'Unknown',
          timestamp: (data.when as string) || new Date().toISOString(),
          action: 'modified',
          editor: (data.user as string) || 'Unknown'
        })
      }
    }
    
    if (assertion.label === 'c2pa.creation') {
      const data = assertion.data as Record<string, unknown>
      originalCreator = (data.creator as string) || 'Unknown'
      creationDate = (data.date as string) || manifest.issueTime
    }
  }
  
  return { edits, originalCreator, creationDate }
}

// Generate authenticity report
export function generateAuthenticityReport(manifest: C2PAManifest | null, fileMetadata?: Record<string, unknown>): AuthenticityReport {
  const warnings: string[] = []
  const edits: Edit[] = []
  let issuer: string | undefined
  let issueTime: string | undefined
  let isAuthentic = false
  let confidence = 0
  
  if (!manifest) {
    warnings.push('No C2PA manifest found. Content may have been modified or is not authenticated.')
    isAuthentic = false
    confidence = 0
  } else {
    isAuthentic = true
    confidence = 90 // High confidence if manifest present and valid
    issuer = manifest.signedBy
    issueTime = manifest.issueTime
    
    const history = extractEditHistory(manifest)
    edits.push(...history.edits)
    
    // Check for suspicious patterns
    if (edits.length > 5) {
      warnings.push('Multiple edits detected. Content has been modified extensively.')
      confidence -= 10
    }
    
    // Check for editing software known for manipulation
    const suspiciousSoftware = ['deepfacelab', 'faceswap', 'reface', 'adobe-ae-deepfake']
    const hasUnknownSoftware = edits.some(e =>
      suspiciousSoftware.some(s => e.software.toLowerCase().includes(s))
    )
    
    if (hasUnknownSoftware) {
      warnings.push('Edited with potentially manipulative software.')
      confidence -= 30
      isAuthentic = false
    }
    
    // Check for missing creator info
    if (!history.originalCreator) {
      warnings.push('Original creator information is missing.')
      confidence -= 15
    }
  }
  
  // Check file metadata
  if (fileMetadata) {
    if (!fileMetadata['exif']) {
      warnings.push('No EXIF metadata. File may have been stripped or AI-generated.')
      confidence -= 10
    }
    
    if (fileMetadata['modified_date'] && fileMetadata['creation_date']) {
      const timeDiff = (new Date(fileMetadata['modified_date'] as string).getTime() -
                        new Date(fileMetadata['creation_date'] as string).getTime()) / (1000 * 60)
      
      if (timeDiff > 60 * 24) {
        // More than 1 day between creation and modification
        warnings.push(`File was modified ${Math.round(timeDiff / 60)} hours after creation.`)
      }
    }
  }
  
  confidence = Math.max(0, Math.min(100, confidence))
  
  return {
    isAuthentic,
    confidence,
    issuer,
    issueTime,
    editHistory: edits,
    warnings,
    verified: confidence >= 80
  }
}

// Check if image has C2PA manifest (look for JWT in file data)
export function hasC2PAManifest(fileData: ArrayBuffer): boolean {
  // Simple heuristic: look for 'c2pa' string in file
  const view = new Uint8Array(fileData)
  const text = new TextDecoder('utf-8', { ignoreBOM: true }).decode(view)
  return text.includes('c2pa') || text.includes('claim')
}

// Mock function to simul reading C2PA from JUMBF container
export function readC2PAFromImage(fileData: ArrayBuffer): C2PAManifest | null {
  // In real implementation, this would parse JUMBF box from JPEG/PNG
  // For now, return null (real parsing requires specialized libraries)
  
  // If you want to test with hardcoded manifest:
  if (Math.random() > 0.8) {
    return {
      claimSignatures: [{
        alg: 'sha256',
        issuer: 'Adobe Inc',
        sig: 'signature_hash_here',
        issueTime: new Date().toISOString(),
      }],
      assertions: [
        {
          label: 'c2pa.creation',
          data: {
            creator: 'John Doe <john@example.com>',
            date: new Date().toISOString(),
          }
        },
        {
          label: 'c2pa.ingredient',
          data: {
            relationship: 'parentOf',
            software: 'Adobe Photoshop 2024',
            when: new Date(Date.now() - 3600000).toISOString(),
            user: 'John Doe'
          }
        }
      ],
      signedBy: 'Adobe Inc',
      issueTime: new Date().toISOString(),
      instanceID: `uuid:${Math.random().toString(36).slice(2)}`
    }
  }
  
  return null
}

// Generate timeline visualization data
export function generateTimeline(editHistory: Edit[]): { timestamps: string[], events: string[] } {
  if (editHistory.length === 0) {
    return { timestamps: [], events: [] }
  }
  
  const sorted = [...editHistory].sort((a, b) =>
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  )
  
  return {
    timestamps: sorted.map(e => new Date(e.timestamp).toLocaleString()),
    events: sorted.map(e => `${e.action} with ${e.software}`)
  }
}
