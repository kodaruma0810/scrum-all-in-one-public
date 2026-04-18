import { TicketStatus } from '@prisma/client';
import * as repository from './repository.js';
import { CreateTicketInput, UpdateTicketInput, TicketFilters } from './types.js';

export async function listTickets(organizationId: string, filters: TicketFilters = {}, teamId?: string) {
  return repository.findMany(organizationId, filters, teamId);
}

export async function getTicket(id: string, organizationId: string) {
  const ticket = await repository.findById(id, organizationId);
  if (!ticket) {
    throw new Error('Ticket not found');
  }
  return ticket;
}

export async function createTicket(organizationId: string, reporterId: string, data: CreateTicketInput) {
  return repository.create(organizationId, reporterId, data);
}

export async function updateTicket(id: string, organizationId: string, data: UpdateTicketInput) {
  const existing = await repository.findById(id, organizationId);
  if (!existing) {
    throw new Error('Ticket not found');
  }
  return repository.update(id, organizationId, data);
}

export async function deleteTicket(id: string, organizationId: string) {
  const existing = await repository.findById(id, organizationId);
  if (!existing) {
    throw new Error('Ticket not found');
  }
  return repository.deleteTicket(id, organizationId);
}

export async function changeStatus(
  id: string,
  organizationId: string,
  status: TicketStatus,
  userId: string
) {
  const existing = await repository.findById(id, organizationId);
  if (!existing) {
    throw new Error('Ticket not found');
  }
  const fromStatus = existing.status;
  const updated = await repository.update(id, organizationId, {});
  // Update the status separately
  const ticket = await import('../../db/client.js').then(({ prisma }) =>
    prisma.ticket.update({
      where: { id },
      data: { status },
      include: {
        assignee: { select: { id: true, name: true, avatarUrl: true } },
        reporter: { select: { id: true, name: true } },
      },
    })
  );
  await repository.createStatusHistory(id, fromStatus, status, userId);
  return ticket;
}

export async function getComments(ticketId: string) {
  return repository.findComments(ticketId);
}

export async function addComment(ticketId: string, authorId: string, content: string) {
  return repository.createComment(ticketId, authorId, content);
}

export async function updateDod(
  ticketId: string,
  organizationId: string,
  items: { dodItemId: string; checked: boolean }[],
  userId: string
) {
  const results = await Promise.all(
    items.map((item) =>
      repository.updateDodCheckResult(ticketId, item.dodItemId, item.checked, userId)
    )
  );
  return results;
}

export async function getBacklog(organizationId: string) {
  return repository.findBacklog(organizationId);
}

export async function getBurndown(sprintId: string, organizationId: string) {
  return repository.getBurndownData(sprintId, organizationId);
}
