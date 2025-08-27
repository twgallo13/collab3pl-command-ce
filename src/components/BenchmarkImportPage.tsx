import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Upload, 
  CheckCircle, 
  Warning, 
  XCircle, 
  FileText, 
  AlertTriangle,
  Check,
  X,
  Database,
  Clock
} from '@phosphor-icons/react'
import { BenchmarkValidationAPI, ValidationRequest, ValidationResponse } from '@/lib/benchmarkValidationAPI'
import { validateImports } from '@/api/benchmarks/imports/validate'
import { commitImports, CommitRequest, CommitResponse } from '@/api/benchmarks/imports/commit'
import { toast } from 'sonner'

interface FileUploadState {
  file: File | null
  url: string | null
}

interface FileUploadProps {
  label: string
  fileName: string
  value: FileUploadState
  onChange: (state: FileUploadState) => void
  disabled?: boolean
}

function FileUpload({ label, fileName, value, onChange, disabled }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null
    if (file) {
      // Simulate file upload by creating a mock URL
      const mockUrl = `https://storage.example.com/uploads/${file.name}`
      onChange({ file, url: mockUrl })
      toast.success(`File "${file.name}" prepared for upload`)
    } else {
      onChange({ file: null, url: null })
    }
  }

  const handleRemoveFile = () => {
    onChange({ file: null, url: null })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={fileName} className="text-sm font-medium">
        {label}
      </Label>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Input
            ref={fileInputRef}
            id={fileName}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            disabled={disabled}
            className="flex-1"
          />
          {value.file && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRemoveFile}
              disabled={disabled}
            >
              <X size={16} />
            </Button>
          )}
        </div>
        {value.file && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText size={16} />
            <span>{value.file.name}</span>
            <Badge variant="outline" className="text-xs">
              {(value.file.size / 1024).toFixed(1)} KB
            </Badge>
          </div>
        )}
      </div>
    </div>
  )
}

export function BenchmarkImportPage() {
  const [versionId, setVersionId] = useState('')
  const [files, setFiles] = useState<Record<string, FileUploadState>>({
    benchmark_rates: { file: null, url: null },
    value_added_options: { file: null, url: null },
    category_mappings: { file: null, url: null },
    industry_sources: { file: null, url: null },
    region_mappings: { file: null, url: null }
  })
  const [validationResults, setValidationResults] = useState<ValidationResponse | null>(null)
  const [commitResults, setCommitResults] = useState<CommitResponse | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [isCommitting, setIsCommitting] = useState(false)
  const [canImport, setCanImport] = useState(false)
  const [commitMode, setCommitMode] = useState<'replace' | 'upsert'>('replace')

  const fileConfigs = [
    { key: 'benchmark_rates', label: 'Benchmark Rates', fileName: 'benchmark_rates.csv' },
    { key: 'value_added_options', label: 'Value Added Options', fileName: 'value_added_options.csv' },
    { key: 'category_mappings', label: 'Category Mappings', fileName: 'category_mappings.csv' },
    { key: 'industry_sources', label: 'Industry Sources', fileName: 'industry_sources.csv' },
    { key: 'region_mappings', label: 'Region Mappings', fileName: 'region_mappings.csv' }
  ]

  const updateFileState = (key: string, state: FileUploadState) => {
    setFiles(prev => ({
      ...prev,
      [key]: state
    }))
    // Reset validation results when files change
    setValidationResults(null)
    setCanImport(false)
  }

  const areAllFilesUploaded = () => {
    return fileConfigs.every(config => files[config.key].file !== null)
  }

  const isValidationPossible = () => {
    return versionId.trim() !== '' && areAllFilesUploaded()
  }

  const handleValidateFiles = async () => {
    if (!isValidationPossible()) {
      toast.error('Please provide a version ID and upload all required CSV files')
      return
    }

    setIsValidating(true)
    setValidationResults(null)
    setCanImport(false)

    try {
      // Create validation request
      const request: ValidationRequest = {
        version_id: versionId.trim(),
        dry_run: true,
        files: {
          benchmark_rates: files.benchmark_rates.url!,
          value_added_options: files.value_added_options.url!,
          category_mappings: files.category_mappings.url!,
          industry_sources: files.industry_sources.url!,
          region_mappings: files.region_mappings.url!
        }
      }

      // Call validation API
      const result = await validateImports(request)
      setValidationResults(result)

      // Show appropriate toast and enable import if validation passes
      if (result.status === 'valid') {
        toast.success('Validation completed successfully', {
          description: 'All files passed validation checks'
        })
        setCanImport(true)
      } else if (result.status === 'warnings') {
        toast.warning('Validation completed with warnings', {
          description: `${result.warnings.length} warnings found - review before importing`
        })
        setCanImport(true)
      } else {
        toast.error('Validation failed', {
          description: `${result.errors.length} errors found - fix before importing`
        })
        setCanImport(false)
      }

    } catch (error) {
      toast.error('Validation failed', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      })
      setValidationResults(null)
      setCanImport(false)
    } finally {
      setIsValidating(false)
    }
  }

  const handleImportCommit = async () => {
    if (!canImport || !validationResults) {
      toast.error('Cannot import - validation must pass first')
      return
    }

    setIsCommitting(true)
    setCommitResults(null)

    try {
      const commitRequest: CommitRequest = {
        version_id: validationResults.version_id,
        mode: commitMode
      }

      toast.loading('Committing benchmark data...', { id: 'commit-toast' })
      
      const result = await commitImports(commitRequest)
      setCommitResults(result)

      toast.success('Import completed successfully', {
        id: 'commit-toast',
        description: `Version ${result.version_id} has been committed with import ID: ${result.import_id}`
      })

      // Reset form after successful commit
      setCanImport(false)
      setValidationResults(null)

    } catch (error) {
      toast.error('Import failed', {
        id: 'commit-toast',
        description: error instanceof Error ? error.message : 'Unknown error occurred during commit'
      })
    } finally {
      setIsCommitting(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'warnings':
        return <Warning className="h-4 w-4 text-yellow-600" />
      case 'invalid':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'valid':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Valid</Badge>
      case 'warnings':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">Warnings</Badge>
      case 'invalid':
        return <Badge variant="destructive">Invalid</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Import Pricing Benchmarks</h1>
        <p className="text-muted-foreground">
          Upload and validate benchmark pricing data from CSV files
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              File Upload
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Version ID */}
            <div className="space-y-2">
              <Label htmlFor="version-id" className="text-sm font-medium">
                Version ID
              </Label>
              <Input
                id="version-id"
                type="text"
                placeholder="e.g., v2025Q3"
                value={versionId}
                onChange={(e) => setVersionId(e.target.value)}
                disabled={isValidating || isCommitting}
              />
            </div>

            {/* Import Mode Selection */}
            <div className="space-y-2">
              <Label htmlFor="commit-mode" className="text-sm font-medium">
                Import Mode
              </Label>
              <Select value={commitMode} onValueChange={(value: 'replace' | 'upsert') => setCommitMode(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select import mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="replace">Replace - Replace all existing data</SelectItem>
                  <SelectItem value="upsert">Upsert - Update existing, insert new</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {commitMode === 'replace' 
                  ? 'All existing benchmark data will be replaced with the new data'
                  : 'Existing records will be updated, new records will be inserted'}
              </p>
            </div>

            {/* File Uploads */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground">Required CSV Files</h3>
              {fileConfigs.map((config) => (
                <FileUpload
                  key={config.key}
                  label={config.label}
                  fileName={config.fileName}
                  value={files[config.key]}
                  onChange={(state) => updateFileState(config.key, state)}
                  disabled={isValidating || isCommitting}
                />
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-border">
              <Button
                onClick={handleValidateFiles}
                disabled={!isValidationPossible() || isValidating || isCommitting}
                className="flex-1"
              >
                {isValidating ? 'Validating...' : 'Validate Files'}
              </Button>
              <Button
                variant="secondary"
                onClick={handleImportCommit}
                disabled={!canImport || isValidating || isCommitting}
                className="flex-1"
              >
                {isCommitting ? 'Committing...' : `Import (${commitMode})`}
              </Button>
            </div>

            {/* Upload Status */}
            <div className="text-sm text-muted-foreground">
              Files uploaded: {Object.values(files).filter(f => f.file).length} / {fileConfigs.length}
            </div>
          </CardContent>
        </Card>

        {/* Validation Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Validation Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {!validationResults ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Upload files and click "Validate Files" to see results</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Overall Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(validationResults.status)}
                    <span className="font-medium">Overall Status:</span>
                  </div>
                  {getStatusBadge(validationResults.status)}
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Version:</span>
                    <div className="text-muted-foreground">{validationResults.version_id}</div>
                  </div>
                  <div>
                    <span className="font-medium">Files Processed:</span>
                    <div className="text-muted-foreground">
                      {Object.keys(validationResults.per_file).length}
                    </div>
                  </div>
                  {validationResults.errors.length > 0 && (
                    <div>
                      <span className="font-medium text-red-600">Errors:</span>
                      <div className="text-red-600">{validationResults.errors.length}</div>
                    </div>
                  )}
                  {validationResults.warnings.length > 0 && (
                    <div>
                      <span className="font-medium text-yellow-600">Warnings:</span>
                      <div className="text-yellow-600">{validationResults.warnings.length}</div>
                    </div>
                  )}
                </div>

                {/* Diff Information */}
                {validationResults.diff && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">Expected Changes</h4>
                    <div className="text-sm text-blue-700 space-y-1">
                      <div>Inserts: {validationResults.diff.inserts}</div>
                      <div>Updates: {validationResults.diff.updates}</div>
                      <div>Deletes: {validationResults.diff.deletes}</div>
                    </div>
                  </div>
                )}

                {/* Import Status */}
                {canImport && (
                  <Alert>
                    <Check className="h-4 w-4" />
                    <AlertDescription>
                      Validation passed. You can now import this data.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Per-File Validation Details */}
      {validationResults && (
        <Card>
          <CardHeader>
            <CardTitle>File Validation Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Rows Processed</TableHead>
                  <TableHead>Valid</TableHead>
                  <TableHead>Invalid</TableHead>
                  <TableHead>Issues</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(validationResults.per_file).map(([fileName, result]) => (
                  <TableRow key={fileName}>
                    <TableCell className="font-medium">
                      {fileName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(result.status)}
                        {getStatusBadge(result.status)}
                      </div>
                    </TableCell>
                    <TableCell>{result.rows_processed}</TableCell>
                    <TableCell className="text-green-600">{result.valid_rows}</TableCell>
                    <TableCell className="text-red-600">{result.invalid_rows}</TableCell>
                    <TableCell>
                      {result.errors.length > 0 && (
                        <Badge variant="destructive" className="mr-1">
                          {result.errors.length} errors
                        </Badge>
                      )}
                      {result.warnings.length > 0 && (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          {result.warnings.length} warnings
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Error and Warning Details */}
      {validationResults && (validationResults.errors.length > 0 || validationResults.warnings.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Issues Found</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {validationResults.errors.length > 0 && (
              <div>
                <h4 className="font-medium text-red-700 mb-2 flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  Errors ({validationResults.errors.length})
                </h4>
                <div className="space-y-2">
                  {validationResults.errors.slice(0, 10).map((error, index) => (
                    <div key={index} className="text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">
                      {error}
                    </div>
                  ))}
                  {validationResults.errors.length > 10 && (
                    <div className="text-sm text-muted-foreground">
                      ...and {validationResults.errors.length - 10} more errors
                    </div>
                  )}
                </div>
              </div>
            )}

            {validationResults.warnings.length > 0 && (
              <div>
                <h4 className="font-medium text-yellow-700 mb-2 flex items-center gap-2">
                  <Warning className="h-4 w-4" />
                  Warnings ({validationResults.warnings.length})
                </h4>
                <div className="space-y-2">
                  {validationResults.warnings.slice(0, 10).map((warning, index) => (
                    <div key={index} className="text-sm text-yellow-600 bg-yellow-50 p-3 rounded border border-yellow-200">
                      {warning}
                    </div>
                  ))}
                  {validationResults.warnings.length > 10 && (
                    <div className="text-sm text-muted-foreground">
                      ...and {validationResults.warnings.length - 10} more warnings
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Commit Results */}
      {commitResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Import Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="font-medium">Import completed successfully</span>
              <Badge className="bg-green-100 text-green-800 border-green-200">Committed</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Import ID:</span>
                <div className="text-muted-foreground font-mono">{commitResults.import_id}</div>
              </div>
              <div>
                <span className="font-medium">Version:</span>
                <div className="text-muted-foreground">{commitResults.version_id}</div>
              </div>
              <div>
                <span className="font-medium">Mode:</span>
                <div className="text-muted-foreground capitalize">{commitResults.mode}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              {Object.entries(commitResults.counts).map(([fileName, counts]) => (
                <div key={fileName} className="border border-border rounded-lg p-3">
                  <h4 className="font-medium text-sm mb-2 capitalize">
                    {fileName.replace(/_/g, ' ')}
                  </h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>Inserted:</span>
                      <span className="text-green-600 font-medium">{counts.inserted}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Updated:</span>
                      <span className="text-blue-600 font-medium">{counts.updated}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Deleted:</span>
                      <span className="text-red-600 font-medium">{counts.deleted}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {commitResults.warnings.length > 0 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2 flex items-center gap-2">
                  <Warning className="h-4 w-4" />
                  Import Warnings ({commitResults.warnings.length})
                </h4>
                <div className="space-y-1">
                  {commitResults.warnings.map((warning, index) => (
                    <div key={index} className="text-sm text-yellow-700">
                      {warning}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Completed at {new Date(commitResults.timestamp).toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}