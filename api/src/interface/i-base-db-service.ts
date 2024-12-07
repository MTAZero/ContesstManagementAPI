export type QueryParams = {
  skip: number;
  limit: number;
  filter?: object;
  sort?: object;
  textSearch?: string;
};

export type ResponseQuery<T> = {
  items: Array<T>;
  total: number;
  size: number;
  page: number;
  offset: number;
};

export interface IBaseDBService<T> {
  getItems(query: QueryParams): Promise<ResponseQuery<T>>;

  getItemById(id: any): Promise<T | null>;

  updateItem(id: any, entity: any): Promise<any>;

  removeItem(id: any): Promise<boolean>;

  insertItem(entity: any): Promise<any>;
}
