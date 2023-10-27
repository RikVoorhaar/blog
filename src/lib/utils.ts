
export function formatDate(date: string, locales = 'en'): string {
	const dateToFormat = new Date(date.replaceAll('-', '/'));
	
	const day = dateToFormat.getDate();
	const month = new Intl.DateTimeFormat(locales, { month: 'long' }).format(dateToFormat);
	const year = dateToFormat.getFullYear();
  
	const ordinal = (d: number): string => {
	  if (d > 3 && d < 21) return 'th';
	  switch (d % 10) {
		case 1: return 'st';
		case 2: return 'nd';
		case 3: return 'rd';
		default: return 'th';
	  }
	};
  
	return `${day}${ordinal(day)} of ${month}, ${year}`;
  }
  