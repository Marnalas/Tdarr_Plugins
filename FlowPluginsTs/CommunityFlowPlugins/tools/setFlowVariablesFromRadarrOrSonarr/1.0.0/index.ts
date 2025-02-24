import {
  IpluginDetails,
  IpluginInputArgs,
  IpluginOutputArgs,
} from '../../../../FlowHelpers/1.0.0/interfaces/interfaces';
import { getFileName } from '../../../../FlowHelpers/1.0.0/fileUtils';

/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
const details = (): IpluginDetails => ({
  name: 'Set Flow Variables From Radarr Or Sonarr',
  description: 'Set Flow Variables From Radarr or Sonarr. The variables set are : '
    + 'ArrId (internal id for Radarr or Sonarr), '
    + 'ArrOriginalLanguageCode (code of the orignal language (ISO 639-2) as know by Radarr or Sonarr), '
    + 'ArrSeasonNumber (the season number of the episode), '
    + 'ArrEpisodeNumber (the episode number).',
  style: {
    borderColor: 'green',
  },
  tags: '',
  isStartPlugin: false,
  pType: '',
  requiresVersion: '2.11.01',
  sidebarPosition: -1,
  icon: '',
  inputs: [
    {
      label: 'Arr',
      name: 'arr',
      type: 'string',
      defaultValue: 'radarr',
      inputUI: {
        type: 'dropdown',
        options: ['radarr', 'sonarr'],
      },
      tooltip: 'Specify which arr to use',
    },
    {
      label: 'Arr API Key',
      name: 'arr_api_key',
      type: 'string',
      defaultValue: '',
      inputUI: {
        type: 'text',
      },
      tooltip: 'Input your arr api key here',
    },
    {
      label: 'Arr Host',
      name: 'arr_host',
      type: 'string',
      defaultValue: 'http://192.168.1.1:7878',
      inputUI: {
        type: 'text',
      },
      tooltip: 'Input your arr host here.'
        + '\\nExample:\\n'
        + 'http://192.168.1.1:7878\\n'
        + 'http://192.168.1.1:8989\\n'
        + 'https://radarr.domain.com\\n'
        + 'https://sonarr.domain.com\\n',
    },
  ],
  outputs: [
    {
      number: 1,
      tooltip: 'Variables read from Radarr or Sonarr',
    },
    {
      number: 2,
      tooltip: 'Radarr or Sonarr do not know this file',
    },
  ],
});

interface IBaseResponse {
  id: number;
  originalLanguage?: {
    id: number;
    name: string;
  };
}

interface IFileInfo {
  id: string;
  seasonNumber?: number;
  episodeNumber?: number;
  languageName?: string;
}

interface IArrConfig {
  name: 'radarr' | 'sonarr';
  host: string;
  apiKey: string;
}

const API_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
};
// eslint-disable-next-line max-len
const LANGUAGE_API_BASE_URL = 'https://data.opendatasoft.com/api/explore/v2.1/catalog/datasets/iso-language-codes-639-1-and-639-2@public/records';

const createHeaders = (apiKey: string) => ({
  ...API_HEADERS,
  'X-Api-Key': apiKey,
});

const extractImdbId = (fileName: string): string => {
  const match = /\b(tt|nm|co|ev|ch|ni)\d{7,10}?\b/i.exec(fileName);
  return match?.at(0) ?? '';
};

const extractSeasonEpisodeInfo = (fileName: string): { seasonNumber: number; episodeNumber: number } => {
  const seasonEpisodeMatch = /\bS(\d{1,3})E(\d{1,4})\b/i.exec(fileName);
  return {
    seasonNumber: Number(seasonEpisodeMatch?.[1] ?? -1),
    episodeNumber: Number(seasonEpisodeMatch?.[2] ?? -1),
  };
};

const getLanguageCode = async (args: IpluginInputArgs, languageName: string): Promise<string> => {
  if (!languageName) return '';

  try {
    const url = `${LANGUAGE_API_BASE_URL}?select=alpha3_b&where=english%20%3D%20%22${languageName}%22&limit=1`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Language API request failed');

    const data = await response.json();
    return data.results[0]?.alpha3_b ?? '';
  } catch (error) {
    args.jobLog(`Failed to fetch language data: ${(error as Error).message}`);
    return '';
  }
};

const lookupContent = async (args: IpluginInputArgs, config: IArrConfig, fileName: string): Promise<IFileInfo> => {
  const imdbId = extractImdbId(fileName);
  if (!imdbId) return { id: '-1' };

  try {
    const contentType = config.name === 'radarr' ? 'movie' : 'series';
    const response = await args.deps.axios({
      method: 'get',
      url: `${config.host}/api/v3/${contentType}/lookup?term=imdb:${imdbId}`,
      headers: createHeaders(config.apiKey),
    });

    const content: IBaseResponse = response.data[0];
    if (!content) return { id: '-1' };

    const baseInfo = {
      id: String(content.id),
      languageName: content.originalLanguage?.name ?? '',
    };

    if (config.name === 'sonarr') {
      return {
        ...baseInfo,
        ...extractSeasonEpisodeInfo(fileName),
      };
    }

    return baseInfo;
  } catch (error) {
    args.jobLog(`Lookup failed: ${(error as Error).message}`);
    return { id: '-1' };
  }
};

const parseContent = async (args: IpluginInputArgs, config: IArrConfig, fileName: string): Promise<IFileInfo> => {
  try {
    const response = await args.deps.axios({
      method: 'get',
      url: `${config.host}/api/v3/parse?title=${encodeURIComponent(getFileName(fileName))}`,
      headers: createHeaders(config.apiKey),
    });

    const { data } = response;
    const content: IBaseResponse = config.name === 'radarr' ? data.movie : data.series;

    if (!content) return { id: '-1' };

    const baseInfo = {
      id: String(content.id),
      languageName: content.originalLanguage?.name ?? '',
    };

    if (config.name === 'sonarr') {
      return {
        ...baseInfo,
        seasonNumber: data.parsedEpisodeInfo?.seasonNumber ?? 1,
        episodeNumber: data.parsedEpisodeInfo?.episodeNumbers?.[0] ?? 1,
      };
    }

    return baseInfo;
  } catch (error) {
    args.jobLog(`Parse failed: ${(error as Error).message}`);
    return { id: '-1' };
  }
};

const plugin = async (args: IpluginInputArgs): Promise<IpluginOutputArgs> => {
  const lib = require('../../../../../methods/lib')();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
  args.inputs = lib.loadDefaultValues(args.inputs, details);

  const config: IArrConfig = {
    name: args.inputs.arr as 'radarr' | 'sonarr',
    host: String(args.inputs.arr_host).trim().replace(/\/$/, ''),
    apiKey: String(args.inputs.arr_api_key),
  };

  const originalFileName = args.originalLibraryFile?._id ?? '';
  const currentFileName = args.inputFileObj?._id ?? '';

  // Try to get file info from original filename first, then current filename
  let fileInfo = await lookupContent(args, config, originalFileName);
  if (fileInfo.id === '-1' && currentFileName !== originalFileName) {
    fileInfo = await lookupContent(args, config, currentFileName);
  }

  // If lookup fails, try parsing
  if (fileInfo.id === '-1') {
    fileInfo = await parseContent(args, config, originalFileName);
    if (fileInfo.id === '-1' && currentFileName !== originalFileName) {
      fileInfo = await parseContent(args, config, currentFileName);
    }
  }

  // Set variables if content was found
  if (fileInfo.id !== '-1') {
    // eslint-disable-next-line no-param-reassign
    args.variables.user = args.variables.user || {};

    // Set common variables
    // eslint-disable-next-line no-param-reassign
    args.variables.user.ArrId = fileInfo.id;
    args.jobLog(`Setting variable ArrId to ${args.variables.user.ArrId}`);
    // eslint-disable-next-line no-param-reassign
    args.variables.user.ArrOriginalLanguageCode = await getLanguageCode(args, fileInfo.languageName ?? '');
    args.jobLog(`Setting variable ArrOriginalLanguageCode to ${args.variables.user.ArrOriginalLanguageCode}`);

    // Set Sonarr-specific variables
    if (config.name === 'sonarr') {
      // eslint-disable-next-line no-param-reassign
      args.variables.user.ArrSeasonNumber = String(fileInfo.seasonNumber ?? 0);
      args.jobLog(`Setting variable ArrSeasonNumber to ${args.variables.user.ArrSeasonNumber}`);
      // eslint-disable-next-line no-param-reassign
      args.variables.user.ArrEpisodeNumber = String(fileInfo.episodeNumber ?? 0);
      args.jobLog(`Setting variable ArrEpisodeNumber to ${args.variables.user.ArrEpisodeNumber}`);
    }

    return {
      outputFileObj: args.inputFileObj,
      outputNumber: 1,
      variables: args.variables,
    };
  }

  return {
    outputFileObj: args.inputFileObj,
    outputNumber: 2,
    variables: args.variables,
  };
};

export { details, plugin };
