import {MercadoPagoConfig, Preference} from "mercadopago";
import {redirect} from "next/navigation";
import {createClient} from "@supabase/supabase-js";

import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";

const client = new MercadoPagoConfig({accessToken: process.env.MP_ACCESS_TOKEN!});
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET!);

export default async function Home() {
  const donations = await supabase
    .from("donations")
    .select("*")
    .then(
      ({data}) =>
        data as unknown as Promise<
          {id: number; created_at: number; amount: number; message: string}[]
        >,
    );

  async function donate(formData: FormData) {
    "use server";

    const preference = await new Preference(client).create({
      body: {
        items: [
          {
            id: "donacion",
            title: formData.get("message") as string,
            quantity: 1,
            unit_price: Number(formData.get("amount")),
          },
        ],
      },
    });

    redirect(preference.sandbox_init_point!);
  }

  return (
    <section className="dark container m-auto grid min-h-screen grid-rows-[auto,1fr,auto] bg-background px-4 font-sans antialiased">
      <header className="text-xl font-bold leading-[4rem]">stream-donancy</header>
      <main className="py-8">
        <section className="grid gap-12">
          <form action={donate} className="m-auto grid max-w-96 gap-8 border p-4">
            <Label className="grid gap-2">
              <span>Valor</span>
              <Input name="amount" type="number" />
            </Label>
            <Label className="grid gap-2">
              <span>Tu mensaje en la donación</span>
              <Textarea name="message" />
            </Label>
            <Button type="submit">Enviar</Button>
          </form>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cantidad</TableHead>
                <TableHead className="text-right">Mensaje</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {donations.map((donation) => {
                return (
                  <TableRow key={donation.id}>
                    <TableCell className="font-bold">
                      {donation.amount.toLocaleString("es-AR", {
                        style: "currency",
                        currency: "ARS",
                      })}
                    </TableCell>
                    <TableCell className="text-right">{donation.message}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </section>
      </main>
      <footer className="text-center leading-[4rem] opacity-70">
        © {new Date().getFullYear()} stream-donancy
      </footer>
    </section>
  );
}
