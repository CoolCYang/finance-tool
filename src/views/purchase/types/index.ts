// Excel单元格数据接口
export interface ExcelCell {
  address: string
  value: any
  formattedValue: string
  type: string
}

// 表格数据接口
export interface TableData {
  fileName: string
  headers: string[]
  data: Record<string, any>[]
}

// 工作表数据接口
export interface SheetData {
  sheetName: string
  headers: string[]
  data: Record<string, any>[]
  isLoaded: boolean
  worksheet?: any
  rawData?: any[][]
}

// 价格走势数据接口
export interface PriceTrend {
  date: string
  price: number
  quantity: number
  totalAmount: number
}

// 价格趋势分析结果接口
export interface PriceTrendAnalysis {
  year: number
  startPrice: number
  endPrice: number
  changeAmount: number
  changePercentage: number
  startDate: string
  endDate: string
}

// 规格型号数据接口
export interface SpecificationData {
  specification: string
  quantity: number
  totalAmount: number
  averagePrice: number
  priceTrend: PriceTrend[]
  priceTrendAnalysis: PriceTrendAnalysis[]
  rows: Record<string, any>[]
}

// 存货数据接口
export interface InventoryData {
  inventoryName: string
  specifications: SpecificationData[]
  quantity: number
  totalAmount: number
  averagePrice: number
  rows: Record<string, any>[]
}

// 供应商数据接口
export interface SupplierData {
  supplierName: string
  inventories: InventoryData[]
  quantity: number
  totalAmount: number
  averagePrice: number
}

// 扁平分类数据接口
export interface FlatClassificationData {
  // 供应商信息
  supplierName: string
  supplierTotalQuantity: number
  supplierTotalAmount: number
  supplierAveragePrice: number

  // 存货信息
  inventoryName: string
  inventoryTotalQuantity: number
  inventoryTotalAmount: number
  inventoryAveragePrice: number

  // 规格型号信息
  specification: string
  specificationQuantity: number
  specificationTotalAmount: number
  specificationAveragePrice: number

  // 价格走势信息
  priceTrend: PriceTrend[]
  priceTrendAnalysis: PriceTrendAnalysis[]
}

// 文件数据接口
export interface FileData {
  fileName: string
  fileId: string
  sheetData: SheetData[]
  currentSheetIndex: number
}
