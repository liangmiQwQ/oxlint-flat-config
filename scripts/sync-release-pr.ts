// This short-lived CLI runs git and gh sequentially; synchronous calls keep failures explicit.
/* oxlint-disable node/no-sync */
import { execFileSync } from 'node:child_process'
import process from 'node:process'

interface ReleasePR {
  number: number
  body: string
  baseRefOid: string
  headRefOid: string
  isCrossRepository: boolean
  url: string
}

interface Manifest {
  name: string
  version: string
  private?: boolean
}

function git(...args: string[]): string {
  return execFileSync('git', args, { encoding: 'utf8' }).trim()
}

function gh(...args: string[]): string {
  return execFileSync('gh', args, { encoding: 'utf8' }).trim()
}

function manifests(ref: string): Map<string, Manifest> {
  const paths = git('ls-tree', '-r', '--name-only', ref, '--', 'packages').split('\n')
  return new Map(
    paths
      .filter(path => /^packages\/[^/]+\/package.json$/.test(path))
      .map(path => [path, JSON.parse(git('show', `${ref}:${path}`)) as Manifest])
  )
}

function syncReleasePR(): void {
  const branch = process.env.GITHUB_REF_NAME ?? git('branch', '--show-current')
  if (!/^release\/.+-pending$/.test(branch)) {
    throw new Error('Expected a release/*-pending branch')
  }
  const prs = JSON.parse(
    gh(
      'pr',
      'list',
      '--head',
      branch,
      '--state',
      'open',
      '--json',
      'number,body,baseRefOid,headRefOid,isCrossRepository,url'
    )
  ) as ReleasePR[]
  const pr = prs.find(candidate => !candidate.isCrossRepository)
  if (!pr || pr.headRefOid !== git('rev-parse', 'HEAD')) {
    console.log('No open release PR at this commit; skipping.')
    return
  }

  const marker = '## 👉 Changelog'
  const markerIndex = pr.body.indexOf(marker)
  if (markerIndex === -1) {
    throw new Error('Expected an uppt changelog; leaving the PR unchanged')
  }
  const preamble = pr.body.slice(0, markerIndex).trimEnd()
  const changelog = pr.body.slice(markerIndex + marker.length).trim()
  // Package sections contain their own level-three headings, so split only at version headings.
  const footerIndex = changelog.search(
    /^### (?:📝 Other commits|🎉 New Contributors|❤️ Contributors)/m
  )
  const footer = footerIndex < 0 ? '' : changelog.slice(footerIndex)
  const packageNotes = footerIndex < 0 ? changelog : changelog.slice(0, footerIndex)
  const headings = [...packageNotes.matchAll(/^### (.+) \(([^\n]+) → ([^\n]+)\)\r?$/gm)]
  const previousNotes = new Map(
    headings.map((heading, index) => [
      heading[1],
      packageNotes.slice(heading.index + heading[0].length, headings[index + 1]?.index).trim()
    ])
  )

  const base = manifests(pr.baseRefOid)
  const sections: string[] = []
  const repositoryUrl = pr.url.split('/pull/')[0]
  for (const [path, pkg] of manifests(pr.headRefOid)) {
    const previous = base.get(path)
    if (pkg.private || !pkg.version || pkg.version === previous?.version) {
      continue
    }
    const compare = `[compare changes](${repositoryUrl}/compare/${pr.baseRefOid}...${pr.headRefOid})`
    const notes = previousNotes.get(pkg.name)
    // Preserve existing release notes, but point comparisons at the actual hand-edited release.
    const updatedNotes = notes
      ? notes.replaceAll(/\[compare changes\]\([^\n)]+\)/g, compare)
      : `${compare}\n\n- Manually selected for release.`
    sections.push(
      `### ${pkg.name} (${previous?.version ?? 'new'} → ${pkg.version})\n\n${updatedNotes}`
    )
  }

  const title = `chore: release ${sections.length} package${sections.length === 1 ? '' : 's'}`
  const body = [preamble, marker, ...sections, footer].filter(Boolean).join('\n\n').trimEnd()
  if (process.argv.includes('--dry-run')) {
    console.log(JSON.stringify({ title, body }, null, 2))
    return
  }

  // A newer push can arrive while the notes are being assembled.
  const latest = JSON.parse(gh('pr', 'view', String(pr.number), '--json', 'headRefOid,body,state'))
  if (latest.headRefOid !== pr.headRefOid || latest.body !== pr.body || latest.state !== 'OPEN') {
    console.log('The PR changed while syncing; skipping this stale update.')
    return
  }
  gh('pr', 'edit', String(pr.number), '--title', title, '--body', body)
}

syncReleasePR()
