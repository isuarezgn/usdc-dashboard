'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink,
  Copy,
  Wallet
} from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';
import { isValidEthereumAddress, getEtherscanUrl } from '@/lib/wallet-utils';
import { toast } from 'sonner';

const transferSchema = z.object({
  recipientAddress: z.string()
    .min(1, 'Recipient address is required')
    .refine(isValidEthereumAddress, 'Invalid Ethereum address'),
  amount: z.string()
    .min(1, 'Amount is required')
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    }, 'Amount must be a positive number')
    .refine((val) => {
      const num = parseFloat(val);
      return num <= 1000000; // Reasonable max for testnet
    }, 'Amount too large')
});

type TransferFormData = z.infer<typeof transferSchema>;

interface TransferResult {
  txHash: string;
  success: boolean;
  error?: string;
}

export function TransferUSDC() {
  const { address, usdcBalance, transferUSDC, isConnected } = useWallet();
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferResult, setTransferResult] = useState<TransferResult | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingTransfer, setPendingTransfer] = useState<TransferFormData | null>(null);

  const form = useForm<TransferFormData>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      recipientAddress: '',
      amount: ''
    }
  });

  const onSubmit = (data: TransferFormData) => {
    setPendingTransfer(data);
    setShowConfirmDialog(true);
  };

  const executeTransfer = async () => {
    if (!pendingTransfer) return;

    setIsTransferring(true);
    setShowConfirmDialog(false);

    try {
      const txHash = await transferUSDC(pendingTransfer.recipientAddress, pendingTransfer.amount);
      setTransferResult({
        txHash,
        success: true
      });

      toast.success('Transfer initiated successfully!');
      form.reset();
    } catch (error: any) {
      let message = '';
      console.log('Transfer failed:', error.message);
      if(error.message?.includes('user rejected action'))
        message = 'Transaction was rejected by user.';
      else
        message = error.message;

      setTransferResult({
        txHash: '',
        success: false,
        error: message || 'Transfer failed'
      });

      toast.error('Transfer failed. Please try again.');

    } finally {
      setIsTransferring(false);
      setPendingTransfer(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
            <Wallet className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Wallet Not Connected</h3>
          <p className="text-muted-foreground">Please connect your wallet to transfer USDC</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-6 w-6 text-blue-600" />
            Transfer USDC
          </CardTitle>
          <CardDescription>
            Send USDC tokens to another address on the Ethereum testnet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-blue-900">Available Balance</label>
                <div className="text-2xl font-bold text-blue-600">{usdcBalance} USDC</div>
              </div>
              <Badge variant="outline" className="border-blue-200 text-blue-600">
                Testnet
              </Badge>
            </div>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="recipientAddress">Recipient Address</Label>
              <Input
                id="recipientAddress"
                placeholder="0x..."
                {...form.register('recipientAddress')}
                className="font-mono"
              />
              {form.formState.errors.recipientAddress && (
                <p className="text-sm text-red-600">{form.formState.errors.recipientAddress.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (USDC)</Label>
              <Input
                id="amount"
                type="number"
                step="0.000001"
                placeholder="0.00"
                {...form.register('amount')}
              />
              {form.formState.errors.amount && (
                <p className="text-sm text-red-600">{form.formState.errors.amount.message}</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-base"
              disabled={isTransferring || !form.formState.isValid}
            >
              {isTransferring ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Processing Transfer...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5 mr-2" />
                  Send USDC
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Transfer Result */}
      {transferResult && (
        <Card>
          <CardContent className="p-6">
            {transferResult.success ? (
              <div className="text-center">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-green-600 mb-2">Transfer Successful!</h3>
                <p className="text-muted-foreground mb-4">
                  Your USDC transfer has been submitted to the blockchain
                </p>
                <div className="space-y-3">
                  <div className="p-3 bg-muted rounded-lg">
                    <label className="text-sm font-medium text-muted-foreground">Transaction Hash</label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="flex-1 text-sm break-all">{transferResult.txHash}</code>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => copyToClipboard(transferResult.txHash)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" asChild className="flex-1">
                      <a 
                        href={getEtherscanUrl(transferResult.txHash, 'tx', true)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View on Etherscan
                      </a>
                    </Button>
                    <Button onClick={() => setTransferResult(null)} className="flex-1">
                      Send Another
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-red-600 mb-2">Transfer Failed</h3>
                <p className="text-muted-foreground mb-4">{transferResult.error}</p>
                <Button onClick={() => setTransferResult(null)} variant="outline">
                  Try Again
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Transfer</DialogTitle>
            <DialogDescription>
              Please review the transfer details before proceeding
            </DialogDescription>
          </DialogHeader>
          
          {pendingTransfer && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Amount:</span>
                  <span className="font-semibold">{pendingTransfer.amount} USDC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">To:</span>
                  <span className="font-mono text-sm">{pendingTransfer.recipientAddress.slice(0, 10)}...{pendingTransfer.recipientAddress.slice(-8)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Network:</span>
                  <Badge>Testnet</Badge>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This transaction cannot be reversed. Please verify the recipient address is correct.
                </AlertDescription>
              </Alert>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={executeTransfer}
                  disabled={isTransferring}
                  className="flex-1"
                >
                  {isTransferring ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Confirming...
                    </>
                  ) : (
                    'Confirm Transfer'
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}