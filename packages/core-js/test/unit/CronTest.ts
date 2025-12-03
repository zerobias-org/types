import { expect } from "chai";
import { CronImpl } from "../../src/Cron.js";
import { CronExpression, DayOfWeek, Month, TimeZone } from "../../generated/model/index.js";

describe('CronEvent', function () {
  it('should handle a cron string #1', async function () {
    const ce = CronImpl.fromString('23 0-20/2 * * *');
    expect(ce).to.be.ok;
    expect(ce.toString()).to.be.be.eq('23 0-20/2 * * *');
    expect(ce.next()).to.be.ok;
    expect(ce.previous()).to.be.ok;
  });

  it('should handle a cron string #2', async function () {
    const ce = CronImpl.fromString('6 * * * *');
    expect(ce).to.be.ok;
    expect(ce.toString()).to.be.be.eq('6 * * * *');
    expect(ce.next()).to.be.ok;
    expect(ce.previous()).to.be.ok;
  });

  it('should handle a cron string #3', async function () {
    const ce = CronImpl.fromString('@daily');
    expect(ce).to.be.ok;
    expect(ce.toString()).to.be.be.eq('0 0 * * *');
    expect(ce.next()).to.be.ok;
    expect(ce.previous()).to.be.ok;
  });

  it('should handle a cron string #4', async function () {
    const ce = CronImpl.fromString('@monthly');
    expect(ce).to.be.ok;
    expect(ce.toString()).to.be.be.eq('0 0 1 * *');
    expect(ce.next()).to.be.ok;
    expect(ce.previous()).to.be.ok;
  });

  it('should handle a cron object #1', async function () {
    const cr = new CronExpression([30], [20], [2], [Month.June], [DayOfWeek.Monday]);
    const ce = CronImpl.fromCron(cr);
    expect(ce).to.be.ok;
    expect(ce.toString()).to.be.be.eq('30 20 2 6 1');
    expect(ce.next()).to.be.ok;
    expect(ce.previous()).to.be.ok;
    expect(ce.cron).to.be.eq(cr);
  });

  it('should handle a cron object', async function () {
    const cr = new CronExpression(30, '0-20/2', undefined, Month.June, DayOfWeek.Monday);
    const ce = CronImpl.fromCron(cr);
    expect(ce).to.be.ok;
    expect(ce.toString()).to.be.be.eq('30 0-20/2 * 6 1');
    expect(ce.next()).to.be.ok;
    expect(ce.previous()).to.be.ok;
    expect(ce.cron).to.be.eq(cr);
  });

  it('should handle a cron object with object spread constructor', async function () {
    const cr: CronExpression = {
      minute: "30",
      hour: "10"
    }
    const ce = CronImpl.fromCron(cr);
    expect(ce).to.be.ok;
    expect(ce.toString()).to.be.be.eq('30 10 * * *');
    expect(ce.next()).to.be.ok;
    expect(ce.previous()).to.be.ok;
    expect(ce.cron).to.be.eq(cr);
  });

  it('should preserve * when using a Cron Model', async function () {
    let cr = new CronExpression('*', '*', '*', '*', '*');
    let ce = CronImpl.fromCron(cr);
    expect(ce).to.be.ok;
    expect(ce.toString()).to.be.be.eq('* * * * *');
    
    cr = new CronExpression(30, '*', '*', '*', '*');
    ce = CronImpl.fromCron(cr);
    expect(ce).to.be.ok;
    expect(ce.toString()).to.be.be.eq('30 * * * *');

    cr = new CronExpression(30, 12, '*', '*', '*');
    ce = CronImpl.fromCron(cr);
    expect(ce).to.be.ok;
    expect(ce.toString()).to.be.be.eq('30 12 * * *');

    cr = new CronExpression(30, 12, 2, '*', '*');
    ce = CronImpl.fromCron(cr);
    expect(ce).to.be.ok;
    expect(ce.toString()).to.be.be.eq('30 12 2 * *');

    cr = new CronExpression(30, 12, 2, Month.August, '*');
    ce = CronImpl.fromCron(cr);
    expect(ce).to.be.ok;
    expect(ce.toString()).to.be.be.eq('30 12 2 8 *');

    cr = new CronExpression(30, 12, 2, '*', DayOfWeek.Friday);
    ce = CronImpl.fromCron(cr);
    expect(ce).to.be.ok;
    expect(ce.toString()).to.be.be.eq('30 12 2 * 5');

    cr = new CronExpression(0, 12, '*', '*', '*');
    ce = CronImpl.fromCron(cr);
    expect(ce).to.be.ok;
    expect(ce.toString()).to.be.be.eq('0 12 * * *');
  });

  it('should preserve * when using a string', async function () {
    let ce = CronImpl.fromString('* * * * *');
    expect(ce).to.be.ok;
    expect(ce.toString()).to.be.be.eq('* * * * *');
    
    ce = CronImpl.fromString('30 * * * *');
    expect(ce).to.be.ok;
    expect(ce.toString()).to.be.be.eq('30 * * * *');

    ce = CronImpl.fromString('30 12 * * *');
    expect(ce).to.be.ok;
    expect(ce.toString()).to.be.be.eq('30 12 * * *');

    ce = CronImpl.fromString('30 12 2 * *');
    expect(ce).to.be.ok;
    expect(ce.toString()).to.be.be.eq('30 12 2 * *');

    ce = CronImpl.fromString('30 12 2 8 *');
    expect(ce).to.be.ok;
    expect(ce.toString()).to.be.be.eq('30 12 2 8 *');

    ce = CronImpl.fromString('30 12 2 * 5');
    expect(ce).to.be.ok;
    expect(ce.toString()).to.be.be.eq('30 12 2 * 5');
  });
});
