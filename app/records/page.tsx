'use client'

import { Suspense, useEffect, useState } from 'react'
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
import { PeopleHub } from '@/components/records/people-hub'
import { PersonProfile } from '@/components/records/person-profile'
import { UploadDrawer } from '@/components/records/upload-drawer'
import { bankTransactions } from '@/lib/fixtures/records/banking'
import { invoices, payments } from '@/lib/fixtures/records/billing'
import { cyclesNewestFirst } from '@/lib/fixtures/records/cycles'
import { documents } from '@/lib/fixtures/records/documents'
import { recordPeople } from '@/lib/fixtures/records/people'
import { counterparties } from '@/lib/fixtures/counterparties'
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
    // Consume the params so in-app navigation stays clean.
    router.replace('/records', { scroll: false })
  }, [searchParams, router])

  const openCycle = openCycleId
    ? (cyclesNewestFirst.find((c) => c.id === openCycleId) ?? null)
    : null
  const openPerson = openPersonId
    ? (recordPeople.find((p) => p.id === openPersonId) ?? null)
    : null
  const openCounterparty = openCounterpartyId
    ? (counterparties.find((c) => c.id === openCounterpartyId) ?? null)
    : null
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
        {activeTab === 'counterparties' &&
          (openCounterparty ? (
            <CounterpartyProfile
              counterparty={openCounterparty}
              onBack={() => setOpenCounterpartyId(null)}
            />
          ) : (
            <CounterpartiesHub
              counterparties={counterparties}
              onOpenCounterparty={setOpenCounterpartyId}
            />
          ))}
        {activeTab === 'cycles' &&
          (openCycle ? (
            <CycleDetail
              cycle={openCycle}
              onBack={() => setOpenCycleId(null)}
              onOpenPerson={handleOpenPerson}
            />
          ) : (
            <CyclesHub cycles={cyclesNewestFirst} onOpenCycle={handleOpenCycle} />
          ))}
        {activeTab === 'banking' && <BankingHub transactions={bankTransactions} />}
        {activeTab === 'billing' && (
          <BillingHub invoices={invoices} payments={payments} counterparties={counterparties} />
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
