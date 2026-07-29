'use client'

import { useState } from 'react'
import { UploadIcon } from 'lucide-react'
import { AppShell } from '@/components/shell/app-shell'
import { Button } from '@/components/ui/button'
import { BankingHub } from '@/components/records/banking-hub'
import { BillingHub } from '@/components/records/billing-hub'
import { ClientsHub } from '@/components/records/clients-hub'
import { ContractsHub } from '@/components/records/contracts-hub'
import { CycleDetail } from '@/components/records/cycle-detail'
import { CyclesHub } from '@/components/records/cycles-hub'
import { DocumentsHub } from '@/components/records/documents-hub'
import { PeopleHub } from '@/components/records/people-hub'
import { UploadDrawer } from '@/components/records/upload-drawer'
import { bankTransactions } from '@/lib/fixtures/records/banking'
import { invoices, payments } from '@/lib/fixtures/records/billing'
import { cyclesNewestFirst } from '@/lib/fixtures/records/cycles'
import { documents } from '@/lib/fixtures/records/documents'
import { recordPeople } from '@/lib/fixtures/records/people'
import { clients } from '@/lib/fixtures/clients'
import { entities, users } from '@/lib/fixtures/workspace'
import type { AppUser, Entity, FilterChip } from '@/lib/types'

const recordsTabs = [
  { id: 'people', number: '01', label: 'People' },
  { id: 'clients', number: '02', label: 'Clients' },
  { id: 'cycles', number: '03', label: 'Pay cycles' },
  { id: 'banking', number: '04', label: 'Banking' },
  { id: 'billing', number: '05', label: 'Billing' },
  { id: 'contracts', number: '06', label: 'Contracts' },
  { id: 'documents', number: '07', label: 'Documents' },
] as const

export default function RecordsPage() {
  const [entity, setEntity] = useState<Entity>(entities[0])
  const [chips, setChips] = useState<FilterChip[]>([])
  const [user, setUser] = useState<AppUser>(users[0])
  const [activeTab, setActiveTab] = useState<string>('people')
  const [openCycleId, setOpenCycleId] = useState<string | null>(null)
  const [highlightedPersonId, setHighlightedPersonId] = useState<string | null>(null)
  const [uploadOpen, setUploadOpen] = useState(false)

  const openCycle = openCycleId
    ? (cyclesNewestFirst.find((c) => c.id === openCycleId) ?? null)
    : null

  function handleOpenPerson(personId: string) {
    setHighlightedPersonId(personId)
    setOpenCycleId(null)
    setActiveTab('people')
  }

  function handleTabChange(id: string) {
    setActiveTab(id)
    setOpenCycleId(null)
    if (id !== 'people') setHighlightedPersonId(null)
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

        {activeTab === 'people' && (
          <PeopleHub people={recordPeople} highlightedId={highlightedPersonId} />
        )}
        {activeTab === 'clients' && <ClientsHub clients={clients} />}
        {activeTab === 'cycles' &&
          (openCycle ? (
            <CycleDetail
              cycle={openCycle}
              onBack={() => setOpenCycleId(null)}
              onOpenPerson={handleOpenPerson}
            />
          ) : (
            <CyclesHub cycles={cyclesNewestFirst} onOpenCycle={setOpenCycleId} />
          ))}
        {activeTab === 'banking' && <BankingHub transactions={bankTransactions} />}
        {activeTab === 'billing' && (
          <BillingHub invoices={invoices} payments={payments} clients={clients} />
        )}
        {activeTab === 'contracts' && <ContractsHub clients={clients} />}
        {activeTab === 'documents' && <DocumentsHub documents={documents} />}
      </div>

      <UploadDrawer open={uploadOpen} onOpenChange={setUploadOpen} />
    </AppShell>
  )
}
