import { API_VERSION } from 'src/const/commons';

export const ApiResponse = (
  res,
  status,
  code,
  message,
  data,
  version = API_VERSION,
) => {
  const ans = {
    input_correct: status,
    code: code,
    message: message,
    data: data,
    version: 'Api version ' + version,
  };

  return res.status(code).send(ans);
};

export const ReturnErrorParams = (
  res,
  code,
  message,
  version = API_VERSION,
) => {
  const ans = {
    input_correct: false,
    code: code,
    message: 'Input params not correct : ' + message,
    data: {},
    version: 'Api version ' + version,
  };

  return res.status(code).send(ans);
};
