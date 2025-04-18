// src/components/ServiceTest.tsx
import React from 'react';
import { useGeneStreamService, useSearchService } from '../services';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Layout } from './Layout';

export const ServiceTest: React.FC = () => {
    const geneStreamService = useGeneStreamService();
    const searchService = useSearchService();
    const [result, setResult] = React.useState<any>(null);
    const [error, setError] = React.useState<string>('');
    const [isLoading, setIsLoading] = React.useState(false);

    const testSearch = async () => {
        setIsLoading(true);
        setError('');
        try {
            const results = await searchService.searchSequences({
                query: '',
                page: 1,
                limit: 5
            });
            setResult(results);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Search failed');
        } finally {
            setIsLoading(false);
        }
    };

    const testFetchSequence = async () => {
        setIsLoading(true);
        setError('');
        try {
            // Replace with a valid gs_id from your database
            const sequence = await geneStreamService.fetchSequence('k81s-rwd-15kud');
            setResult(sequence);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Fetch failed');
        } finally {
            setIsLoading(false);
        }
    };

    const testAnnotation = async () => {
        setIsLoading(true);
        setError('');
        try {
            // Replace with a valid gs_id
            await geneStreamService.createAnnotation(
                'k81s-rwd-15kud',
                'name',
                'Test annotation'
            );
            setResult({ message: 'Annotation created successfully' });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Annotation failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Layout>
            <div className="w-full max-w-7xl mx-auto px-4 py-6">
                <h1 className="text-2xl font-bold mb-6">Service Test Page</h1>
                <div className="space-y-4">
                    <div className="flex gap-4">
                        <Button 
                            onClick={testSearch}
                            disabled={isLoading}
                        >
                            Test Search
                        </Button>
                        <Button 
                            onClick={testFetchSequence}
                            disabled={isLoading}
                        >
                            Test Fetch Sequence
                        </Button>
                        <Button 
                            onClick={testAnnotation}
                            disabled={isLoading}
                        >
                            Test Annotation
                        </Button>
                    </div>

                    {isLoading && (
                        <div className="p-4 bg-gray-100 rounded">Loading...</div>
                    )}

                    {error && (
                        <div className="p-4 bg-red-100 text-red-700 rounded">
                            Error: {error}
                        </div>
                    )}

                    {result && (
                        <Card>
                            <CardContent className="p-4">
                                <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded">
                                    {JSON.stringify(result, null, 2)}
                                </pre>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </Layout>
    );
};

