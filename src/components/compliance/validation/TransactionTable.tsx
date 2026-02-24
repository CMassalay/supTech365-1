import { Fragment, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Transaction } from "@/types/manualValidation";

interface TransactionTableProps {
  transactions: Transaction[];
}

export function TransactionTable({ transactions }: TransactionTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const toggleRow = (index: number) => {
    setExpandedRows((current) => {
      const next = new Set(current);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>#</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Name</TableHead>
          <TableHead className="w-20">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((transaction, index) => {
          const expanded = expandedRows.has(index);
          return (
            <Fragment key={transaction.id}>
              <TableRow key={`${transaction.id}-summary`}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                <TableCell>{transaction.type}</TableCell>
                <TableCell>{Number(transaction.amount).toLocaleString()}</TableCell>
                <TableCell>{transaction.name}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={() => toggleRow(index)}>
                    {expanded ? "Hide" : "View"}
                  </Button>
                </TableCell>
              </TableRow>
              {expanded && (
                <TableRow key={`${transaction.id}-expanded`}>
                  <TableCell colSpan={6} className="text-sm text-muted-foreground">
                    {transaction.details || "No additional transaction details."}
                  </TableCell>
                </TableRow>
              )}
            </Fragment>
          );
        })}
      </TableBody>
    </Table>
  );
}
