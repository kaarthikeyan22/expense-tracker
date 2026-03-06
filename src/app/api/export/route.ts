import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';

async function getUser() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');
    if (sessionCookie?.value) {
      return JSON.parse(sessionCookie.value);
    }
    return null;
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all data
    const expenses = await db.expense.findMany({
      where: { userId: user.id },
      include: { category: true },
      orderBy: { date: 'desc' },
    });

    const savings = await db.saving.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate totals
    const totalExpenses = expenses.reduce((sum: number, exp: { amount: number }) => sum + exp.amount, 0);
    const totalSavings = savings.reduce((sum: number, s: { currentAmount: number }) => sum + s.currentAmount, 0);
    const totalSavingsTarget = savings.reduce((sum: number, s: { targetAmount: number }) => sum + s.targetAmount, 0);

    // Create workbook
    const workbook = XLSX.utils.book_new();

    // Sheet 1: Summary (Total Expenses & Total Savings)
    const summaryData = [
      ['EXPENSE TRACKER SUMMARY'],
      [''],
      ['Category', 'Amount'],
      ['Total Expenses', totalExpenses],
      ['Total Savings (Current)', totalSavings],
      ['Total Savings (Target)', totalSavingsTarget],
      [''],
      ['Net Balance (Savings - Expenses)', totalSavings - totalExpenses],
      [''],
      ['Generated on', new Date().toLocaleDateString()],
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    
    // Set column widths for summary
    summarySheet['!cols'] = [{ wch: 30 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    // Sheet 2: Expenses
    const expensesData = [
      ['Date', 'Description', 'Category', 'Amount'],
      ...expenses.map((exp: { date: Date; description: string; category: { name: string }; amount: number }) => [
        new Date(exp.date).toLocaleDateString(),
        exp.description,
        exp.category.name,
        exp.amount,
      ]),
      [''],
      ['TOTAL', '', '', totalExpenses],
    ];
    const expensesSheet = XLSX.utils.aoa_to_sheet(expensesData);
    expensesSheet['!cols'] = [{ wch: 15 }, { wch: 30 }, { wch: 15 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(workbook, expensesSheet, 'Expenses');

    // Sheet 3: Savings
    const savingsData = [
      ['Title', 'Current Amount', 'Target Amount', 'Progress %', 'Remaining', 'Target Date'],
      ...savings.map((s: { title: string; currentAmount: number; targetAmount: number; targetDate: Date | null }) => {
        const progress = ((s.currentAmount / s.targetAmount) * 100).toFixed(1);
        const remaining = s.targetAmount - s.currentAmount;
        return [
          s.title,
          s.currentAmount,
          s.targetAmount,
          progress + '%',
          remaining,
          s.targetDate ? new Date(s.targetDate).toLocaleDateString() : 'N/A',
        ];
      }),
      [''],
      ['TOTAL', totalSavings, totalSavingsTarget, '', '', ''],
    ];
    const savingsSheet = XLSX.utils.aoa_to_sheet(savingsData);
    savingsSheet['!cols'] = [
      { wch: 20 },
      { wch: 15 },
      { wch: 15 },
      { wch: 12 },
      { wch: 12 },
      { wch: 15 },
    ];
    XLSX.utils.book_append_sheet(workbook, savingsSheet, 'Savings');

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Return as downloadable file
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="expense-tracker.xlsx"',
      },
    });
  } catch (error) {
    console.error('Error exporting data:', error);
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
}