export class DateServiceMOCK {
  getNow(): Date {
    return new Date();
  }

  isBefore() {
    return false;
  }

  addDays(days: number) {
    return new Date();
  }
}
