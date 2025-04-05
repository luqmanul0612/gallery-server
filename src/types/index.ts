export type DirItemType = {
  path: string;
  name: string;
  totalItems: number;
};

export type FileItemType = {
  path: string;
  name: string;
  size: number;
  ext: string;
};

export type FileListType = {
  files: FileItemType[];
  path: string;
  totalFile: number;
};
