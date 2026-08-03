'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { UploadIcon } from 'lucide-react'
import { AppShell } from '@/components/shell/app-shell'
import { Button } from '@/components/ui/button'
import { BankingHub } from '@/components/records/banking-hub'
import { BillingHub } from '@/components/records/billing-hub'
import { CounterpartiesHub } from '@/components/records/counterparties-hub'
import { CounterpartyProfile } from '@/components/records/counterparty-profile'
import { CycleDetail } from '@/components/records/cycle-detail'
import { CyclesHub } from '@/components/records/cycles-hub'
import { DocumentPreviewDrawer } from '@/components/records/document-preview-drawer'
import { DocumentsHub } from '@/components/records/documents-hub'
import { MasterDetail, DetailPlaceholder } from '@/components/records/master-detail'
import { PeopleHub } from '@/components/records/people-hub'
import { PersonProfile } from '@/components/records/person-profile'
import { SampleDataChip } from '@/components/records/records-bits'
import { UploadDrawer } from '@/components/records/upload-drawer'
import { useCounterparties, useCycles } from '@/lib/records-api/resources'
import { prefetchSummaries } from '@/lib/records-api/summary-cache'
import { invoices, payments } from '@/lib/fixtures/records/billing'
import { documents } from '@/lib/fixtures/records/documents'
import { recordPeople } from '@/lib/fixtures/records/people'
import { entities, users } from '@/lib/fixtures/workspace'
import type { AppUser, Entity, FilterChip } from '@/lib/types'

const recordsTabs = [
  { id: 'people', number: '01', label: 'People' },
  { id: 'counterparties', number: '02', label: 'Counterparties' },
  { id: 'cycles', number: '03', label: 'Pay cycles' },
  { id: 'banking', number: '04', label: 'Banking' },
  { id: 'billing', number: '05', label: 'Billing' },
  { id: 'documents', number: '06', label: 'Documents' },
] as const

const validTabs = new Set<string>(recordsTabs.map((t) => t.id))

function RecordsPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [entity, setEntity] = useState<Entity>(entities[0])
  const [chips, setChips] = useState<FilterChip[]>([])
  const [user, setUser] = useState<AppUser>(users[0])
  const [activeTab, setActiveTab] = useState<string>('people')
  const [openCycleId, setOpenCycleId] = useState<string | null>(null)
  const [openPersonId, setOpenPersonId] = useState<string | null>(null)
  const [openCounterpartyId, setOpenCounterpartyId] = useState<string | null>(null)
  const [openDocumentId, setOpenDocumentId] = useState<string | null>(null)
  const [uploadOpen, setUploadOpen] = useState(false)

  // Live data (fixture fallback + source flag handled inside the hooks).
  const { data: counterparties, source: cpSource } = useCounterparties()
  const { data: cycles, source: cycleSource } = useCycles()

  /* Prefetch hover summaries for visible rows so hovers stay instant. */
  useEffect(() => {
    if (activeTab === 'counterparties') {
      prefetchSummaries(counterparties.map((cp) => ({ type: 'counterparty', id: cp.id })))
    } else if (activeTab === 'cycles') {
      prefetchSummaries(cycles.map((c) => ({ type: 'cycle', id: c.id })))
    } else if (activeTab === 'people') {
      prefetchSummaries(recordPeople.map((p) => ({ type: 'person', id: p.name })))
    }
  }, [activeTab, counterparties, cycles])

  /* Deep links from global search: /records?tab=cycles&open=2026-07-H1 */
  useEffect(() => {
    const tab = searchParams.get('tab')
    const openId = searchParams.get('open')
    if (!tab || !validTabs.has(tab)) return
    setActiveTab(tab)
    setOpenCycleId(tab === 'cycles' ? openId : null)
    setOpenPersonId(tab === 'people' ? openId : null)
    setOpenCounterpartyId(tab === 'counterparties' ? openId : null)
    setOpenDocumentId(tab === 'documents' ? openId : null)
    router.replace('/records', { scroll: false })
  }, [searchParams, router])

  const openCycle = useMemo(
    () => (openCycleId ? (cycles.find((c) => c.id === openCycleId) ?? null) : null),
    [openCycleId, cycles],
  )
  const openPerson = openPersonId
    ? (recordPeople.find((p) => p.id === openPersonId) ?? null)
    : null
  const openCounterparty = useMemo(
    () =>
      openCounterpartyId
        ? (counterparties.find((c) => c.id === openCounterpartyId) ?? null)
        : null,
    [openCounterpartyId, counterparties],
  )
  const openDocument = openDocumentId
    ? (documents.find((d) => d.id === openDocumentId) ?? null)
    : null

  function handleOpenPerson(personId: string) {
    setOpenCycleId(null)
    setOpenPersonId(personId)
    setActiveTab('people')
  }

  function handleOpenCycle(cycleId: string) {
    setOpenPersonId(null)
    setOpenCycleId(cycleId)
    setActiveTab('cycles')
  }

  function handleOpenEvidence(tab: string, openId?: string) {
    setOpenDocumentId(null)
    if (!validTabs.has(tab)) return
    setActiveTab(tab)
    setOpenCycleId(tab === 'cycles' ? (openId ?? null) : null)
    setOpenPersonId(tab === 'people' ? (openId ?? null) : null)
    setOpenCounterpartyId(tab === 'counterparties' ? (openId ?? null) : null)
  }

  function handleTabChange(id: string) {
    setActiveTab(id)
    setOpenCycleId(null)
    setOpenPersonId(null)
    setOpenCounterpartyId(null)
  }

  return (
    <AppShell
      activeSection="records"
      entity={entity}
      onEntityChange={setEntity}
      chips={chips}
      onChipsChange={setChips}
      user={user}
      onUserChange={setUser}
      subTabs={[...recordsTabs]}
      activeSubTab={activeTab}
      onSubTabChange={handleTabChange}
    >
      <div className="flex min-h-full flex-col pb-16">
        {/* Persistent upload — every record enters through the same door. */}
        <div className="flex items-center justify-end px-5 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setUploadOpen(true)}
            className="text-muted-foreground"
          >
            <UploadIcon data-icon="inline-start" />
            Upload
          </Button>
        </div>

        {activeTab === 'people' &&
          (openPerson ? (
            <PersonProfile
              person={openPerson}
              onBack={() => setOpenPersonId(null)}
              onOpenCycle={handleOpenCycle}
            />
          ) : (
            <PeopleHub
              people={recordPeople}
              highlightedId={null}
              onOpenPerson={handleOpenPerson}
            />
          ))}

        {activeTab === 'counterparties' && (
          <MasterDetail
            hasSelection={Boolean(openCounterparty)}
            onBack={() => setOpenCounterpartyId(null)}
            backLabel="Counterparties"
            list={
              <CounterpartiesHub
                counterparties={counterparties}
                selectedId={openCounterpartyId}
                onOpenCounterparty={setOpenCounterpartyId}
                source={cpSource}
              />
            }
            detail={
              openCounterparty ? (
                <CounterpartyProfile
                  counterparty={openCounterparty}
                  onBack={() => setOpenCounterpartyId(null)}
                />
              ) : null
            }
            emptyDetail={
              <DetailPlaceholder
                title="Select a counterparty"
                subline="Roles, relationships, contracts, and invoices open here."
              />
            }
          />
        )}

        {activeTab === 'cycles' && (
          <MasterDetail
            hasSelection={Boolean(openCycle)}
            onBack={() => setOpenCycleId(null)}
            backLabel="Pay cycles"
            list={
              <CyclesHub
                cycles={cycles}
                selectedId={openCycleId}
                onOpenCycle={handleOpenCycle}
                source={cycleSource}
              />
            }
            detail={
              openCycle ? (
                <CycleDetail
                  cycle={openCycle}
                  onBack={() => setOpenCycleId(null)}
                  onOpenPerson={handleOpenPerson}
                />
              ) : null
            }
            emptyDetail={
              <DetailPlaceholder
                title="Select a pay cycle"
                subline="The frozen sheet, per-person lines, and totals open here."
              />
            }
          />
        )}

        {activeTab === 'banking' && <BankingHub entity={entity.id} />}

        {activeTab === 'billing' && (
          <div>
            <div className="flex items-center gap-2 px-5 pt-6 pb-2">
              <SampleDataChip source="fallback" />
              <span className="text-meta">
                Billing runs on sample data until invoices land in the database.
              </span>
            </div>
            <BillingHub invoices={invoices} payments={payments} counterparties={counterparties} />
          </div>
        )}

        {activeTab === 'documents' && (
          <DocumentsHub documents={documents} onOpenDocument={setOpenDocumentId} />
        )}
      </div>

      <UploadDrawer open={uploadOpen} onOpenChange={setUploadOpen} />
      <DocumentPreviewDrawer
        document={openDocument}
        onOpenChange={(open) => {
          if (!open) setOpenDocumentId(null)
        }}
        onOpenEvidence={handleOpenEvidence}
      />
    </AppShell>
  )
}

export default function RecordsPage() {
  return (
    <Suspense>
      <RecordsPageInner />
    </Suspense>
  )
}
