import { civicStorage } from './storage'
import type { CivicDocument, DocumentCategory } from '@/types'
import type { DocumentUploadFormData } from '@/schemas'

export const documentService = {
  async getDocuments(params?: { category?: DocumentCategory; query?: string; onlyFavorites?: boolean }): Promise<CivicDocument[]> {
    await new Promise((resolve) => setTimeout(resolve, 200))
    let docs = civicStorage.getDocuments()

    if (params?.category && params.category !== 'all') {
      docs = docs.filter((d) => d.category === params.category)
    }

    if (params?.onlyFavorites) {
      docs = docs.filter((d) => d.isFavorite)
    }

    if (params?.query && params.query.trim() !== '') {
      const q = params.query.toLowerCase()
      docs = docs.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.documentNumber.toLowerCase().includes(q) ||
          d.issuer.toLowerCase().includes(q) ||
          d.tags.some((t) => t.toLowerCase().includes(q))
      )
    }

    return docs
  },

  async getDocumentById(id: string): Promise<CivicDocument | undefined> {
    const docs = civicStorage.getDocuments()
    return docs.find((d) => d.id === id)
  },

  async toggleFavorite(id: string): Promise<CivicDocument> {
    const docs = civicStorage.getDocuments()
    const index = docs.findIndex((d) => d.id === id)
    if (index === -1) throw new Error('Document not found')
    docs[index].isFavorite = !docs[index].isFavorite
    civicStorage.saveDocuments(docs)
    return docs[index]
  },

  async uploadDocument(data: DocumentUploadFormData, fileName: string, fileSizeStr: string): Promise<CivicDocument> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const docs = civicStorage.getDocuments()
    const newDoc: CivicDocument = {
      id: `doc_${Date.now()}`,
      title: data.title,
      category: data.category,
      documentNumber: data.documentNumber,
      issuer: data.issuer,
      expiryDate: data.expiryDate || undefined,
      issueDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      fileSize: fileSizeStr || '1.8 MB',
      fileType: fileName.toUpperCase().endsWith('.PNG') || fileName.toUpperCase().endsWith('.JPG') ? 'IMAGE' : 'PDF',
      verificationStatus: 'verified',
      isFavorite: false,
      tags: [data.category.toUpperCase(), 'Citizen Upload', 'Verified Repository'],
    }
    const updated = [newDoc, ...docs]
    civicStorage.saveDocuments(updated)
    return newDoc
  },

  async deleteDocument(id: string): Promise<void> {
    const docs = civicStorage.getDocuments()
    const filtered = docs.filter((d) => d.id !== id)
    civicStorage.saveDocuments(filtered)
  },
}
