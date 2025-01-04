import { Button } from '@kittyo/ui/button';
import { cn } from '@kittyo/ui/utils';
import { Link, createFileRoute } from '@tanstack/react-router';
import { apiClient } from '../lib/api-client';

export const Route = createFileRoute('/')({
  component: RouteComponent,
});

function RouteComponent() {
  async function handleClick() {
    const res = await apiClient.api.tasks[':id'].$get({ param: { id: 2 } });
    if (res.status === 200) {
      console.log('Get tas', await res.json());
      return;
    }

    console.log('No tasks');
  }

  return (
    <div>
      <div className={cn('bg-red-200')}>
        <p>Hello form</p>
        <Button asChild>
          <Link to='/about'>About</Link>
        </Button>
        <Button onClick={handleClick}>Get tasks</Button>
      </div>
    </div>
  );
}
