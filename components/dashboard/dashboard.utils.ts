export function fmtCurrency(value?: number | null) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(value ?? 0);
}



export function fmtDate(value?: string | Date | null) {
  if (!value) return '—';

  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}



export function daysLeft(value?: string | Date | null) {

  if (!value) return null;

  const diff =
    new Date(value).getTime() -
    Date.now();


  return Math.max(
    0,
    Math.ceil(
      diff /
      (1000 * 60 * 60 * 24),
    ),
  );

}




export function getCountdown(
  value?: string | Date | null,
) {

  if(!value){

    return {
      days:0,
      hours:0,
      minutes:0,
      seconds:0,
    };

  }


  const difference =
    new Date(value).getTime()
    -
    Date.now();



  if(difference <= 0){

    return {
      days:0,
      hours:0,
      minutes:0,
      seconds:0,
    };

  }




  const seconds =
    Math.floor(
      difference / 1000,
    );


  const days =
    Math.floor(
      seconds / 86400,
    );


  const hours =
    Math.floor(
      (seconds % 86400) / 3600,
    );


  const minutes =
    Math.floor(
      (seconds % 3600) / 60,
    );


  const remainingSeconds =
    seconds % 60;



  return {

    days,

    hours,

    minutes,

    seconds: remainingSeconds,

  };

}