'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function SectionCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Total Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">$1,250.00</div>
          <p className="text-xs text-muted-foreground">
            Trending up this month <br />
            Visitors for the last 6 months
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>New Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">1,234</div>
          <p className="text-xs text-muted-foreground">
            Down 20% this period <br />
            Acquisition needs attention
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">45,678</div>
          <p className="text-xs text-muted-foreground">
            Strong user retention <br />
            Engagement exceed targets
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Growth Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">4.5%</div>
          <p className="text-xs text-muted-foreground">
            Steady performance increase <br />
            Meets growth projections
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
