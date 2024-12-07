export const convertTimeStampToStartDay = (timestamp: number): number => {
  const date = new Date(timestamp);

  date.setHours(0);
  date.setMinutes(0);
  date.setSeconds(0);
  date.setMilliseconds(0);

  const startOfDayTimestamp = date.getTime();

  return startOfDayTimestamp;
};

export const getStartOfMonthTimestamp = (timestamp: number): number => {
  const date = new Date(timestamp);

  date.setDate(1);

  date.setHours(0);
  date.setMinutes(0);
  date.setSeconds(0);
  date.setMilliseconds(0);

  const startOfMonthTimestamp = date.getTime();

  return startOfMonthTimestamp;
};

export const getDayMonthAndYear = (
  date: Date,
): {
  day: number;
  month: number;
  year: number;
} => {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return {
    day,
    month,
    year,
  };
};

export const getMidnightDate = (
  day: number,
  month: number,
  year: number,
): Date => {
  const midnightDate = new Date(year, month - 1, day);
  midnightDate.setHours(0);
  midnightDate.setMinutes(0);
  midnightDate.setSeconds(0);
  midnightDate.setMilliseconds(0);

  return midnightDate;
};

export const getStartNextMonth = (
  month: number,
  year: number,
): {
  day: number;
  month: number;
  year: number;
} => {
  const nextDate = {
    day: 1,
    month: month + 1,
    year: year,
  };
  if (nextDate.month > 12) {
    nextDate.month = nextDate.month - 12;
    nextDate.year = nextDate.year + 1;
  }

  return nextDate;
};

export const getNumDaysOfMonth = (month: number, year: number) => {
  const date = new Date(year, month - 1, 1);
  date.setMonth(date.getMonth() + 1);
  date.setDate(date.getDate() - 1);
  const numDays = date.getDate();

  return numDays;
};

export const getWeekday = (
  day: number,
  month: number,
  year: number,
): number => {
  const date = new Date(year, month - 1, day);
  const weekday = date.getDay();

  // chủ nhật
  if (weekday === 0) return 7;

  return weekday;
};

export const convertTimeStampToDateTime = (timestamp: number): string => {
  
  const date = new Date(timestamp*1000);

  const day = "0" + date.getDate();

  const month = "0" + date.getMonth();

  const year = date.getFullYear();
  // Hours part from the timestamp
  const hours = "0" + date.getHours();

  // Minutes part from the timestamp
  const minutes = "0" + date.getMinutes();

  // Seconds part from the timestamp
  const seconds = "0" + date.getSeconds();

  // Will display time in 10:30:23 format
  const formatedDateTime = hours.substring(hours.length - 2) + ':' + minutes.substring(minutes.length - 2) 
  + ':' + seconds.substring(seconds.length - 2) + ' ' + day.substring(day.length - 2) + '/' + month.substring(month.length - 2) + '/' + year;

  return formatedDateTime;
};