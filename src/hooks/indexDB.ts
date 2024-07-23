import { ref } from 'vue'
import { openDB } from 'idb'

export default function () {
  const dbName = 'TableDataDB'
  const dbVersion = 1
  const data = ref(null)
  const fileList = ref([])

  const openDatabase = async () => {
    return await openDB(dbName, dbVersion, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('tables')) {
          const store = db.createObjectStore('tables', {
            keyPath: 'fileName'
          })
          store.createIndex('fileNameIndex', 'fileName', { unique: true })
        }
      }
    })
  }

  const storeData = async (fileData) => {
    const db = await openDatabase()
    await db.put('tables', JSON.parse(JSON.stringify(fileData)))
    console.log('数据存储成功')
  }

  const retrieveData = async (fileName) => {
    const db = await openDatabase()
    data.value = await db.get('tables', fileName)
  }

  const getStoreAll = async () => {
    const db = await openDatabase()
    fileList.value = await db.getAll('tables')
  }

  const deleteData = async (fileName) => {
    const db = await openDatabase()
    await db.delete('tables', fileName)
  }

  return { fileList, storeData, retrieveData, deleteData, getStoreAll }
}
