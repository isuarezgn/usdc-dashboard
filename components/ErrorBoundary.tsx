'use client';

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; reset: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.log('ErrorBoundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            const reset = () => {
                this.setState({ hasError: false, error: undefined });
            };

            if (this.props.fallback) {
                return <this.props.fallback error={this.state.error} reset={reset} />;
            }

            return (
                <Card className="w-full max-w-md mx-auto">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-600">
                            <AlertTriangle className="h-5 w-5" />
                            Something went wrong
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                        <p className="text-muted-foreground mb-4">
                            {this.state.error?.message || 'An unexpected error occurred'}
                        </p>
                        <Button onClick={reset} variant="outline">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Try again
                        </Button>
                    </CardContent>
                </Card>
            );
        }

        return this.props.children;
    }
}

export function ErrorFallback({ error, reset }: { error?: Error; reset: () => void }) {
    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="h-5 w-5" />
                    Application Error
                </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                    {error?.message || 'Something went wrong while loading the application'}
                </p>
                <Button onClick={reset} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reload Application
                </Button>
            </CardContent>
        </Card>
    );
}