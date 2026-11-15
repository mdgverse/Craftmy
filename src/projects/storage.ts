import type { CharacterData } from '../types/studio';
export interface CameraSnapshot { position: [number,number,number]; target: [number,number,number]; ortho: boolean; fov: number; zoom: number }
export interface SceneData { characters: CharacterData[]; camera: CameraSnapshot }
export interface Project { id: string; name: string; folderId: string | null; updated: number; thumbnail: string | null; scene: SceneData }
export interface Folder { id:string; name:string }
export interface Library { version:1; projects:Project[]; folders:Folder[] }
const KEY='craftmy.library.v1';
export function loadLibrary():Library { const raw=localStorage.getItem(KEY); if(!raw)return {version:1,projects:[],folders:[]}; const data=JSON.parse(raw); if(data.version!==1||!Array.isArray(data.projects)||!Array.isArray(data.folders))throw new Error('Biblioteca inválida ou de versão desconhecida');return data }
export function saveLibrary(library:Library) { localStorage.setItem(KEY,JSON.stringify(library)) }
