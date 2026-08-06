import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],
  allowedDevOrigins: ['hebergos.maxlem24.fr'],
};

export default withNextIntl(nextConfig);
